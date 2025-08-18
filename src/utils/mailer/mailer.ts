import * as sgMail from '@sendgrid/mail'

export class Mailer {
	static async forgotPassword(email: string, name: string, code: string): Promise<boolean> {
		sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
		const msg = {
			to: email,
			from: process.env.SUPPORT_SENDER_EMAIL,
			templateId: 'd-1d717d7a8b024d38ada909d57343dfb4',
			dynamic_template_data: {
				name: name?.trim.length ? name : 'user',
				code,
				supportEmail: process.env.SUPPORT_EMAIL || 'support@healthcare.com',
				securityEmail: process.env.SECURITY_EMAIL || 'security@healthcare.com'
			},
		}
		try {
			await sgMail.send(msg)
			return true
		} catch (error) {
			console.log(JSON.stringify(error))
			return false
		}
	}

	static async sendAdminCredentials(email: string, name: string, password: string): Promise<boolean> {
		sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
		const msg = {
			to: email,
			from: process.env.SUPPORT_SENDER_EMAIL,
			templateId: 'd-2df7002668164ca2af47170328c393c5',
			dynamic_template_data: {
				name: name?.trim?.length ? name : 'Admin',
				email,
				password,
				supportEmail: process.env.SUPPORT_EMAIL || 'support@healthcare.com',
				securityEmail: process.env.SECURITY_EMAIL || 'security@healthcare.com',
			},
		}

		try {
			await sgMail.send(msg)
			return true
		} catch (error) {
			console.error(`${this.sendAdminCredentials.name} throwing error during sending email:`, JSON.stringify(error))
			return false
		}
	}

	static async sendDoctorCredentials(email: string, name: string, password: string): Promise<boolean> {
		sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
		const msg = {
			to: email,
			from: process.env.SUPPORT_SENDER_EMAIL,
			templateId: 'd-fea36c94c0b4409ea6807e0a85e04cfc',
			dynamic_template_data: {
				name: name?.trim?.length ? name : 'Doctor',
				email,
				password,
				supportEmail: process.env.SUPPORT_EMAIL || 'support@healthcare.com',
				securityEmail: process.env.SECURITY_EMAIL || 'security@healthcare.com'
			},
		}

		try {
			await sgMail.send(msg)
			return true
		} catch (error) {
			console.error(`${this.sendDoctorCredentials.name} throwing error during sending email:`, JSON.stringify(error))
			return false
		}
	}

	// TODO: needs to set patiend template email currently added doctor email template id
	static async sendPatientCredentials(email: string, name: string, password: string): Promise<boolean> {
		sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
		const msg = {
			to: email,
			from: process.env.SUPPORT_SENDER_EMAIL,
			templateId: 'd-fea36c94c0b4409ea6807e0a85e04cfc', // Using same template as doctor for now
			dynamic_template_data: {
				name: name?.trim?.length ? name : 'Patient',
				email,
				password,
				supportEmail: process.env.SUPPORT_EMAIL || 'support@healthcare.com',
				securityEmail: process.env.SECURITY_EMAIL || 'security@healthcare.com'
			},
		}
		try {
			await sgMail.send(msg)
			return true
		} catch (error) {
			console.error(`${this.sendPatientCredentials.name} throwing error during sending email:`, JSON.stringify(error))
			return false
		}
	}
}
