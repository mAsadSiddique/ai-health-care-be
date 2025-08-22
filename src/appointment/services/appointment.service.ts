import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Appointment, AppointmentDocument } from '../entities/appointment.entity'
import { User } from '../../user/entities/user.entity'
import { BookAppointmentDTO } from '../dtos/book-appointment.dto'
import { UpdateAppointmentStatusDTO } from '../dtos/update-appointment-status.dto'
import { DoctorCreateAppointmentDTO } from '../dtos/doctor-create-appointment.dto'
import { AppointmentsListingDTO, DoctorAppointmentsListingDTO } from '../dtos/appointments-listing.dto'
import { AppointmentStatus } from '../../utils/enums/appointment-status.enum'
import { UserType } from '../../utils/enums/user-type.enum'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { SharedService } from 'src/shared/shared.service'
import { ExceptionService } from 'src/shared/exception.service'

@Injectable()
export class AppointmentService {
    constructor(
        @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly sharedService: SharedService,
        private readonly exceptionService: ExceptionService,
    ) { }

    async bookAppointment(args: BookAppointmentDTO, patient: User) {
        try {
            // Validate doctor exists and is a doctor
            const doctor = await this.userModel.findOne({
                _id: new Types.ObjectId(args.doctorId),
                userType: UserType.DOCTOR,
                isBlocked: false,
            })

            if (!doctor) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.DOCTOR_NOT_FOUND)
            }

            // Check if doctor has fee set
            if (!doctor.doctorFee || doctor.doctorFee <= 0) {
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.DOCTOR_FEE_NOT_SET)
            }

            // Check for appointment conflicts
            const appointmentDateTime = new Date(args.appointmentDateTime)
            const endTime = new Date(appointmentDateTime.getTime() + args.duration * 60000)

            const conflictingAppointment = await this.appointmentModel.findOne({
                doctorId: new Types.ObjectId(args.doctorId),
                status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED] },
                $or: [
                    {
                        appointmentDateTime: { $lt: endTime },
                        $expr: {
                            $gt: {
                                $add: ['$appointmentDateTime', { $multiply: ['$duration', 60000] }]
                            },
                            appointmentDateTime
                        }
                    }
                ]
            })

            if (conflictingAppointment) {
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.APPOINTMENT_TIME_CONFLICT)
            }

            // Create appointment
            const appointment = new this.appointmentModel({
                patientId: patient._id,
                doctorId: new Types.ObjectId(args.doctorId),
                appointmentDateTime,
                duration: args.duration,
                description: args.description,
                doctorFee: doctor.doctorFee,
                status: AppointmentStatus.PENDING,
            })

            await appointment.save()

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.APPOINTMENT_BOOKED_SUCCESSFULLY, appointment)
        } catch (error) {
            this.sharedService.sendError(error, this.bookAppointment.name)
        }
    }

    async updateAppointmentStatus(args: UpdateAppointmentStatusDTO, doctor: User) {
        try {
            const appointment = await this.appointmentModel.findOne({
                _id: new Types.ObjectId(args.id),
                doctorId: doctor._id,
            }).populate('patient', 'firstName lastName email')

            if (!appointment) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.APPOINTMENT_NOT_FOUND)
            }

            // Validate status transition
            if (appointment.status === AppointmentStatus.REJECTED && args.status === AppointmentStatus.APPROVED) {
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.APPOINTMENT_CANNOT_APPROVE_REJECTED)
            }

            if (appointment.status === AppointmentStatus.APPROVED && args.status === AppointmentStatus.REJECTED) {
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.APPOINTMENT_CANNOT_REJECT_APPROVED)
            }

            // Validate rejection reason
            if (args.status === AppointmentStatus.REJECTED && !args.rejectionReason) {
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.APPOINTMENT_REJECTION_REASON_REQUIRED)
            }

            // Update appointment
            appointment.status = args.status
            if (args.rejectionReason) {
                appointment.rejectionReason = args.rejectionReason
            }

            await appointment.save()

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.APPOINTMENT_STATUS_UPDATED, appointment)
        } catch (error) {
            this.sharedService.sendError(error, this.updateAppointmentStatus.name)
        }
    }

    async doctorCreateAppointment(args: DoctorCreateAppointmentDTO, doctor: User) {
        try {
            // Validate patient exists and is a patient
            const patient = await this.userModel.findOne({
                _id: new Types.ObjectId(args.patientId),
                userType: UserType.PATIENT,
                isBlocked: false,
            })

            if (!patient) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.PATIENT_NOT_FOUND)
            }

            // Check for appointment conflicts
            const appointmentDateTime = new Date(args.appointmentDateTime)
            const endTime = new Date(appointmentDateTime.getTime() + args.duration * 60000)

            const conflictingAppointment = await this.appointmentModel.findOne({
                doctorId: doctor._id,
                status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED] },
                $or: [
                    {
                        appointmentDateTime: { $lt: endTime },
                        $expr: {
                            $gt: {
                                $add: ['$appointmentDateTime', { $multiply: ['$duration', 60000] }]
                            },
                            appointmentDateTime
                        }
                    }
                ]
            })

            if (conflictingAppointment) {
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.APPOINTMENT_TIME_CONFLICT)
            }

            // Create appointment
            const appointment = new this.appointmentModel({
                patientId: new Types.ObjectId(args.patientId),
                doctorId: doctor._id,
                appointmentDateTime,
                duration: args.duration,
                description: args.description,
                doctorFee: doctor.doctorFee || 0,
                status: AppointmentStatus.APPROVED, // Auto-approve when doctor creates
            })

            await appointment.save()

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.APPOINTMENT_CREATED_SUCCESSFULLY, appointment)
        } catch (error) {
            this.sharedService.sendError(error, this.doctorCreateAppointment.name)
        }
    }

    async getPatientAppointments(patient: User, filters: AppointmentsListingDTO) {
        try {
            const query: any = { patientId: patient._id }

            if (filters.id) {
                query._id = new Types.ObjectId(filters.id)
            }

            if (filters.status) {
                query.status = filters.status
            }

            if (filters.date) {
                const startDate = new Date(filters.date)
                const endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + 1)

                query.appointmentDateTime = {
                    $gte: startDate,
                    $lt: endDate
                }
            }

            const appointments = await this.appointmentModel
                .find(query)
                .populate('doctor')
                .sort({ appointmentDateTime: -1 })
                .skip((filters.pageNumber) * filters.pageSize)
                .limit(filters.pageSize)

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.APPOINTMENT_LISTING, appointments)
        } catch (error) {
            this.sharedService.sendError(error, this.getPatientAppointments.name)
        }
    }

    async getDoctorAppointments(doctor: User, filters: AppointmentsListingDTO) {
        try {
            const query: any = { doctorId: doctor._id }

            if (filters.status) {
                query.status = filters.status
            }
            if (filters.id) {
                query._id = new Types.ObjectId(filters.id)
            }

            if (filters.date) {
                const startDate = new Date(filters.date)
                const endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + 1)

                query.appointmentDateTime = {
                    $gte: startDate,
                    $lt: endDate
                }
            }

            if (filters.search) {
                const patientQuery = {
                    $or: [
                        { firstName: { $regex: filters.search, $options: 'i' } },
                        { lastName: { $regex: filters.search, $options: 'i' } },
                        { email: { $regex: filters.search, $options: 'i' } },
                    ]
                }

                const patients = await this.userModel.find(patientQuery).select('_id')
                const patientIds = patients.map(p => p._id)
                query.patientId = { $in: patientIds }
            }

            const appointments = await this.appointmentModel
                .find(query)
                .populate('patient')
                .sort({ appointmentDateTime: -1 })
                .skip((filters.pageNumber) * filters.pageSize)
                .limit(filters.pageSize)

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.APPOINTMENT_LISTING, appointments)
        } catch (error) {
            this.sharedService.sendError(error, this.getDoctorAppointments.name)
        }
    }

    async getAppointmentById(appointmentId: string, user: User) {
        try {
            const appointment = await this.appointmentModel
                .findOne({
                    _id: new Types.ObjectId(appointmentId),
                    $or: [
                        { patientId: user._id },
                        { doctorId: user._id }
                    ]
                })
                .populate('patient', 'firstName lastName email phoneNumber')
                .populate('doctor', 'firstName lastName specialization doctorFee')

            if (!appointment) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.APPOINTMENT_NOT_FOUND)
            }

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.SUCCESS, appointment)
        } catch (error) {
            this.sharedService.sendError(error, this.getAppointmentById.name)
        }
    }

    async getAllAppointments(filters: DoctorAppointmentsListingDTO) {
        try {
            const query: any = {}

            if (filters.doctorId) {
                query.doctorId = new Types.ObjectId(filters.doctorId)
            }

            if (filters.patientId) {
                query.patientId = new Types.ObjectId(filters.patientId)
            }

            if (filters.status) {
                query.status = filters.status
            }

            if (filters.date) {
                const startDate = new Date(filters.date)
                const endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + 1)

                query.appointmentDateTime = {
                    $gte: startDate,
                    $lt: endDate
                }
            }

            if (filters.search) {
                const userQuery = {
                    $or: [
                        { firstName: { $regex: filters.search, $options: 'i' } },
                        { lastName: { $regex: filters.search, $options: 'i' } },
                        { email: { $regex: filters.search, $options: 'i' } },
                    ]
                }

                const users = await this.userModel.find(userQuery).select('_id')
                const userIds = users.map(u => u._id)
                query.$or = [
                    { patientId: { $in: userIds } },
                    { doctorId: { $in: userIds } }
                ]
            }

            const appointments = await this.appointmentModel
                .find(query)
                .populate('patient', 'firstName lastName email phoneNumber')
                .populate('doctor', 'firstName lastName specialization doctorFee email')
                .sort({ appointmentDateTime: -1 })
                .skip((filters.pageNumber) * filters.pageSize)
                .limit(filters.pageSize)

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.APPOINTMENT_LISTING, appointments)
        } catch (error) {
            this.sharedService.sendError(error, this.getAllAppointments.name)
        }
    }

    async getAppointmentByIdForAdmin(appointmentId: string) {
        try {
            const appointment = await this.appointmentModel
                .findOne({
                    _id: new Types.ObjectId(appointmentId)
                })
                .populate('patient', 'firstName lastName email phoneNumber')
                .populate('doctor', 'firstName lastName specialization doctorFee email')

            if (!appointment) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.APPOINTMENT_NOT_FOUND)
            }

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.SUCCESS, appointment)
        } catch (error) {
            this.sharedService.sendError(error, this.getAppointmentByIdForAdmin.name)
        }
    }

    async updateAppointmentStatusByAdmin(appointmentId: string, args: UpdateAppointmentStatusDTO) {
        try {
            const appointment = await this.appointmentModel.findOne({
                _id: new Types.ObjectId(appointmentId)
            }).populate('patient', 'firstName lastName email')
                .populate('doctor', 'firstName lastName email')

            if (!appointment) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.APPOINTMENT_NOT_FOUND)
            }

            // Validate status transition
            if (appointment.status === AppointmentStatus.REJECTED && args.status === AppointmentStatus.APPROVED) {
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.APPOINTMENT_CANNOT_APPROVE_REJECTED)
            }

            if (appointment.status === AppointmentStatus.APPROVED && args.status === AppointmentStatus.REJECTED) {
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.APPOINTMENT_CANNOT_REJECT_APPROVED)
            }

            // Validate rejection reason
            if (args.status === AppointmentStatus.REJECTED && !args.rejectionReason) {
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.APPOINTMENT_REJECTION_REASON_REQUIRED)
            }

            // Update appointment
            appointment.status = args.status
            if (args.rejectionReason) {
                appointment.rejectionReason = args.rejectionReason
            }

            await appointment.save()

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.APPOINTMENT_STATUS_UPDATED, appointment)
        } catch (error) {
            this.sharedService.sendError(error, this.updateAppointmentStatusByAdmin.name)
        }
    }

    async deleteAppointment(appointmentId: string) {
        try {
            const appointment = await this.appointmentModel.findOne({
                _id: new Types.ObjectId(appointmentId)
            })

            if (!appointment) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.APPOINTMENT_NOT_FOUND)
            }

            // Only allow deletion of pending or rejected appointments
            if (appointment.status === AppointmentStatus.APPROVED || appointment.status === AppointmentStatus.COMPLETED) {
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.APPOINTMENT_CANNOT_DELETE_APPROVED)
            }

            await this.appointmentModel.deleteOne({ _id: new Types.ObjectId(appointmentId) })

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.APPOINTMENT_DELETED_SUCCESSFULLY)
        } catch (error) {
            this.sharedService.sendError(error, this.deleteAppointment.name)
        }
    }
}

