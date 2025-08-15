import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { UserType } from '../../utils/enums/user-type.enum'
import { Roles } from '../../utils/enums/roles.enum'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
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

    @Prop({ type: String, enum: UserType, required: true })
    userType: UserType

    // Admin specific fields
    @Prop({ type: String, enum: Roles })
    role: Roles

    // Doctor specific fields
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

    // Patient specific fields (for future use)
    @Prop()
    dateOfBirth: Date

    @Prop()
    gender: string

    @Prop()
    emergencyContact: string

    // Common fields
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

    @Prop()
    deletedAt: Date

    constructor(obj?) {
        if (obj) {
            Object.assign(this, obj)
        }
    }
}

export const UserSchema = SchemaFactory.createForClass(User)

