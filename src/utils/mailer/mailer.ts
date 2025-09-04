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

	static async sendEmailVerificationCode(email: string, name: string, code: string): Promise<boolean> {
		sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
		const msg = {
			to: email,
			from: process.env.SUPPORT_SENDER_EMAIL,
			templateId: 'd-db9728ea016940029cc560af37824199',
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

	static async sendPatientCredentials(email: string, name: string, password: string): Promise<boolean> {
		sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
		const msg = {
			to: email,
			from: process.env.SUPPORT_SENDER_EMAIL,
			templateId: 'd-80ea5d503f1f4da89dc2b697ed391f45',
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

	static async sendHospitalAlert(
		hospitalEmails: string[],
		patientName: string,
		patientEmail: string,
		patientPhone: string,
		healthStatus: string
	): Promise<boolean> {
		sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

		// helper to split array into chunks of given size
		const chunkArray = (arr: string[], size: number) => {
			const result: string[][] = []
			for (let i = 0; i < arr.length; i += size) {
				result.push(arr.slice(i, i + size))
			}
			return result
		}

		// split into 10-recipient chunks
		const emailChunks = chunkArray(hospitalEmails, 10)
		// format date as DD-MM-YYYY hh:mm AM/PM
		const now = new Date()
		const day = String(now.getDate()).padStart(2, "0")
		const month = String(now.getMonth() + 1).padStart(2, "0")
		const year = now.getFullYear()

		let hours = now.getHours()
		const minutes = String(now.getMinutes()).padStart(2, "0")
		const ampm = hours >= 12 ? "PM" : "AM"
		hours = hours % 12
		hours = hours ? hours : 12 // 0 → 12

		const formattedTime = `${day}-${month}-${year} ${String(hours).padStart(
			2,
			"0"
		)}:${minutes} ${ampm}`
		try {
			for (const chunk of emailChunks) {
				const msg = {
					to: chunk,
					from: process.env.SUPPORT_SENDER_EMAIL!,
					templateId: "d-4af8cd353bb14c1b86035fd72cbb0ff7",
					dynamic_template_data: {
						alertTime: formattedTime,
						patientName,
						patientEmail,
						patientPhone,
						healthStatus,
					},
				}

				// send one batch before moving to the next
				await sgMail.send(msg)
			}

			return true
		} catch (error) {
			console.error(
				`${this.sendHospitalAlert.name} throwing error during sending email:`,
				JSON.stringify(error)
			)
			return false
		}
	}

	static async sendHospitalAlerts(
		hospitalEmails: string[],
		patientName: string,
		patientEmail: string,
		patientPhone: string,
		healthStatus: string,
		analysisDetails: any
	): Promise<boolean> {
		sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

		// Send to multiple hospitals
		const messages = hospitalEmails.map(email => ({
			to: email,
			from: process.env.SUPPORT_SENDER_EMAIL,
			subject: '🚨 CRITICAL PATIENT ALERT - Immediate Medical Attention Required',
			html: this.generateHospitalAlertEmail(
				patientName,
				patientEmail,
				patientPhone,
				healthStatus,
				analysisDetails
			)
		}))

		try {
			await sgMail.send(messages)
			return true
		} catch (error) {
			console.error(`${this.sendHospitalAlert.name} throwing error during sending alert emails:`, JSON.stringify(error))
			return false
		}
	}

	private static generateHospitalAlertEmail(
		patientName: string,
		patientEmail: string,
		patientPhone: string,
		healthStatus: string,
		analysisDetails: any
	): string {
		const currentTime = new Date().toLocaleString()

		return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Critical Patient Alert</title>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.alert-header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
					.alert-content { padding: 20px; background-color: #f8f9fa; }
					.patient-info { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px; }
					.analysis-details { background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; margin: 15px 0; border-radius: 5px; }
					.urgent { color: #dc3545; font-weight: bold; }
					.contact-info { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 15px 0; border-radius: 5px; }
				</style>
			</head>
			<body>
				<div class="alert-header">
					<h1>🚨 CRITICAL PATIENT ALERT 🚨</h1>
					<h2>Immediate Medical Attention Required</h2>
					<p><strong>Alert Time:</strong> ${currentTime}</p>
				</div>
				
				<div class="alert-content">
					<div class="patient-info">
						<h3>Patient Information</h3>
						<p><strong>Name:</strong> ${patientName || 'Not provided'}</p>
						<p><strong>Email:</strong> ${patientEmail || 'Not provided'}</p>
						<p><strong>Phone:</strong> ${patientPhone || 'Not provided'}</p>
						<p><strong>Health Status:</strong> <span class="urgent">${healthStatus}</span></p>
					</div>
					
					<div class="analysis-details">
						<h3>Analysis Details</h3>
						<pre>${JSON.stringify(analysisDetails, null, 2)}</pre>
					</div>
					
					<div class="contact-info">
						<h3>⚠️ URGENT ACTION REQUIRED</h3>
						<p>This patient has been identified as having a <strong class="urgent">CRITICAL</strong> health condition requiring immediate medical attention.</p>
						<p>Please contact the patient immediately and provide necessary medical assistance.</p>
					</div>
					<p><em>This is an automated alert from the AI Healthcare System. Please respond immediately.</em></p>
				</div>
			</body>
			</html>
		`
	}
}
