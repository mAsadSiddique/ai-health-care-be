import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { AppointmentStatus } from '../../utils/enums/appointment-status.enum'

export type AppointmentDocument = Appointment & Document

@Schema({ timestamps: true })
export class Appointment {
    _id: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    patientId: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    doctorId: Types.ObjectId

    @Prop({ required: true })
    appointmentDateTime: Date

    @Prop({ required: true, min: 15, max: 480 }) // Duration in minutes (15 min to 8 hours)
    duration: number

    @Prop()
    description: string

    @Prop({ type: String, enum: AppointmentStatus, default: AppointmentStatus.PENDING })
    status: AppointmentStatus

    @Prop({ required: true, default: 0 })
    doctorFee: number

    @Prop({ maxlength: 500 })
    rejectionReason?: string

    @Prop()
    createdAt: Date

    @Prop()
    updatedAt: Date

    @Prop()
    deletedAt?: Date

    constructor(obj?) {
        if (obj) {
            Object.assign(this, obj)
        }
    }
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment)

// Enable virtuals in JSON/object output
AppointmentSchema.set('toJSON', { virtuals: true })
AppointmentSchema.set('toObject', { virtuals: true })

// Virtual relations
AppointmentSchema.virtual('patient', {
    ref: 'User',
    localField: 'patientId',
    foreignField: '_id',
    justOne: true,
})

AppointmentSchema.virtual('doctor', {
    ref: 'User',
    localField: 'doctorId',
    foreignField: '_id',
    justOne: true,
})

// Indexes for better query performance
AppointmentSchema.index({ patientId: 1, appointmentDateTime: 1 })
AppointmentSchema.index({ doctorId: 1, appointmentDateTime: 1 })
AppointmentSchema.index({ status: 1 })
AppointmentSchema.index({ appointmentDateTime: 1 })

