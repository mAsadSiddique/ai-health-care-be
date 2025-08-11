import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Roles } from '../../utils/enums/roles.enum'

export type AdminDocument = Admin & Document

@Schema({ timestamps: true })
export class Admin {
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
	twoFaAuth: string

	@Prop({ default: false })
	isTwoFaEnable: boolean

	@Prop({ default: false })
	isBlocked: boolean

	@Prop({ type: String, enum: Roles, required: true })
	role: Roles

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

export const AdminSchema = SchemaFactory.createForClass(Admin)
