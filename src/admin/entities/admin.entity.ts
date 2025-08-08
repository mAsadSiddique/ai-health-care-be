import { Roles } from '../../utils/enums/roles.enum'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Admin {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	email: string

	@Column()
	password: string

	@Column({ name: 'is_email_verified', default: false })
	isEmailVerified: boolean

	@Column({ name: 'first_name', nullable: true })
	firstName: string

	@Column({ name: 'last_name', nullable: true })
	lastName: string

	@Column({ name: 'two_fa_auth', nullable: true })
	twoFaAuth: string

	@Column({ name: 'is_two_fa_enable', default: false })
	isTwoFaEnable: boolean

	@Column({ name: 'is_blocked', default: false })
	isBlocked: boolean

	@Column({ type: 'enum', enum: Roles })
	role: Roles

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date

	constructor(obj?) {
		if (obj) {
			Object.assign(this, obj)
		}
	}
}
