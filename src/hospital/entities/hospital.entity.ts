import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type HospitalDocument = Hospital & Document

@Schema({ timestamps: true })
export class Hospital {
    _id: Types.ObjectId

    @Prop({ required: true })
    name: string

    @Prop({ required: true, unique: true })
    email: string

    @Prop()
    phoneNumber: string

    @Prop()
    address: string

    @Prop()
    city: string

    @Prop()
    state: string

    @Prop()
    country: string

    @Prop()
    postalCode: string

    @Prop()
    website: string

    @Prop()
    description: string

    @Prop()
    capacity: number

    @Prop()
    specialties: string[]

    @Prop()
    emergencyContact: string

    @Prop({ default: true })
    isActive: boolean

    @Prop()
    createdAt: Date

    @Prop()
    updatedAt: Date

    @Prop()
    deletedAt: Date
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital)

