import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Hospital, HospitalDocument } from '../entities/hospital.entity'
import { AddHospitalDTO } from '../dtos/add-hospital.dto'
import { UpdateHospitalDTO } from '../dtos/update-hospital.dto'
import { HospitalsListingDTO } from '../dtos/hospitals-listing.dto'
import { SharedService } from '../../shared/shared.service'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { ExceptionService } from 'src/shared/exception.service'

@Injectable()
export class HospitalService {
    constructor(
        @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
        private readonly sharedService: SharedService,
        private readonly exceptionService: ExceptionService
    ) { }

    async addHospital(args: AddHospitalDTO): Promise<any> {
        try {
            // Check if hospital with same email already exists
            const hospital = await this.hospitalModel.findOne({
                email: args.email,
            }) || new this.hospitalModel(args)

            if (hospital._id && hospital.deletedAt === null) {
                this.exceptionService.sendConflictException('Hospital with this email already exists')
            }
            hospital.deletedAt = null
            await this.hospitalModel.findOneAndUpdate(
                { _id: hospital._id }, // filter (use unique field like _id, name, or code)
                { $set: hospital },    // update fields
                { new: true, upsert: true } // options
            )

            return this.sharedService.sendResponse('Hospital registered successfully', hospital)
        } catch (error) {
            this.sharedService.sendError(error, this.addHospital.name)
        }
    }

    async updateHospital(args: UpdateHospitalDTO): Promise<any> {
        try {
            // Check if hospital exists
            const existingHospital = await this.hospitalModel.findOne({
                _id: new Types.ObjectId(args.id),
                deletedAt: null
            })

            if (!existingHospital) {
                this.exceptionService.sendNotFoundException('Hospital not found')
            }

            // If email is being updated, check for uniqueness
            if (args.email && args.email !== existingHospital.email) {
                const emailExists = await this.hospitalModel.findOne({
                    email: args.email,
                    deletedAt: null,
                    _id: { $ne: new Types.ObjectId(args.id) }
                })

                if (emailExists) {
                    this.exceptionService.sendConflictException('Hospital with this email already exists')
                }
            }
            const { id, ...fieldsToUpdate } = args
            const updatedHospital = await this.hospitalModel.findByIdAndUpdate(
                id,
                { ...fieldsToUpdate },
                { new: true }
            )

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.DATA_UPDATED_SUCCESSFULLY, updatedHospital)
        } catch (error) {
            this.sharedService.sendError(error, this.updateHospital.name)
        }
    }

    async deleteHospital(hospitalId: string): Promise<any> {
        try {
            const existingHospital = await this.hospitalModel.findOne({
                _id: new Types.ObjectId(hospitalId),
                deletedAt: null
            })

            if (!existingHospital) {
                this.exceptionService.sendNotFoundException('Hospital not found')
            }

            await this.hospitalModel.findByIdAndUpdate(hospitalId, {
                deletedAt: new Date()
            })

            return this.sharedService.sendResponse('Hospital deleted successfully')
        } catch (error) {
            this.sharedService.sendError(error, this.deleteHospital.name)
        }
    }

    async listHospitals(filters: HospitalsListingDTO): Promise<any> {
        try {
            const query: any = { deletedAt: null }

            if (filters.id) {
                query._id = new Types.ObjectId(filters.id)
            }

            // Apply filters
            if (filters.name) {
                query.name = { $regex: filters.name, $options: 'i' }
            }

            if (filters.email) {
                query.email = { $regex: filters.email, $options: 'i' }
            }

            if (filters.city) {
                query.city = { $regex: filters.city, $options: 'i' }
            }

            if (filters.state) {
                query.state = { $regex: filters.state, $options: 'i' }
            }

            if (filters.country) {
                query.country = { $regex: filters.country, $options: 'i' }
            }

            if (filters.isActive !== undefined) {
                query.isActive = filters.isActive
            }

            if (filters.specialty) {
                query.specialties = { $regex: filters.specialty, $options: 'i' }
            }

            if (filters.minCapacity || filters.maxCapacity) {
                query.capacity = {}
                if (filters.minCapacity) {
                    query.capacity.$gte = filters.minCapacity
                }
                if (filters.maxCapacity) {
                    query.capacity.$lte = filters.maxCapacity
                }
            }

            const [hospitals, totalCount] = await Promise.all([
                this.hospitalModel
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip((filters.pageNumber || 0) * (filters.pageSize || 10))
                    .limit(filters.pageSize || 10),
                this.hospitalModel.countDocuments(query)
            ])

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.SUCCESS, {
                hospitals,
                totalCount
            })
        } catch (error) {
            this.sharedService.sendError(error, this.listHospitals.name)
        }
    }

    async getAllActiveHospitalEmails(): Promise<string[]> {
        try {
            const hospitals = await this.hospitalModel.find({
                isActive: true,
                deletedAt: null
            }).select('email')

            return hospitals.map(hospital => hospital.email)
        } catch (error) {
            console.error('Error fetching hospital emails:', error)
            return []
        }
    }
}

