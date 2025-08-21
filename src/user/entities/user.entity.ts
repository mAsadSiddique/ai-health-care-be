import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { PatientAnalyzeData } from './patient_analyze_data.entity'
import { UserType } from '../../utils/enums/user-type.enum'
import { Roles } from '../../utils/enums/roles.enum'
import { GenderEnum } from 'src/utils/enums/gender.enum'
import { UserDobType } from 'src/utils/enums/dob.type'
import { DoctorSalaryType } from 'src/utils/types/doctor.types'

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

    @Prop({ type: Object })
    salary: DoctorSalaryType

    @Prop()
    qualification: string

    @Prop()
    address: string

    // Patient specific fields (for future use)
    @Prop({ type: Object })
    dateOfBirth: UserDobType

    @Prop({ type: String, enum: GenderEnum })
    gender: GenderEnum

    @Prop()
    age: number

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

    @Prop({ type: Types.ObjectId, ref: 'User' })
    PatientDoctorId: Types.ObjectId;

    constructor(obj?) {
        if (obj) {
            Object.assign(this, obj)
        }
    }
}

export const UserSchema = SchemaFactory.createForClass(User)

// Enable virtuals in JSON/object output
UserSchema.set('toJSON', { virtuals: true })
UserSchema.set('toObject', { virtuals: true })

// Virtual relation: User (one) -> PatientAnalyzeData (many)
UserSchema.virtual('analyzeData', {
    ref: PatientAnalyzeData.name,
    localField: '_id',
    foreignField: 'patientId',
    justOne: false,
})

