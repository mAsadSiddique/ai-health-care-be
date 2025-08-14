import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type DoctorDocument = Doctor & Document

@Schema({ timestamps: true })
export class Doctor {
    _id: Types.ObjectId

    @Prop({ required: true, unique: true })
    email: string

    @Prop({ required: true })
    password: string

    @Prop({ default: false })
    isEmailVerified: boolean

    @Prop()
    firstName: string

    @Prop()
    lastName: string

    @Prop()
    phoneNumber: string

    @Prop()
    specialization: string

    @Prop()
    licenseNumber: string

    @Prop()
    experience: number

    @Prop()
    qualification: string

    @Prop()
    address: string

    @Prop()
    twoFaAuth: string

    @Prop({ default: false })
    isTwoFaEnable: boolean

    @Prop({ default: false })
    isBlocked: boolean

    @Prop()
    createdAt: Date

    @Prop()
    updatedAt: Date

    constructor(obj?) {
        if (obj) {
            Object.assign(this, obj)
        }
    }
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor)
