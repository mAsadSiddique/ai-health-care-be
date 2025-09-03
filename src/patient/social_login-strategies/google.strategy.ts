import { PassportStrategy, AuthGuard } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { SharedService } from '../../shared/shared.service'
import { UserSocialLoginType } from 'src/utils/types/user_social_login.type'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(private readonly sharedService: SharedService) {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_SECRET,
			callbackURL: process.env.GOOGLE_REDIRECT_URL,
			scope: ['email', 'profile'],
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
		try {
			const { id, name, emails, photos } = profile
			const user: UserSocialLoginType = {
				password: id,
				email: emails[0].value,
				firstName: name.givenName,
				lastName: name.familyName,
				username: (name.givenName + id)?.toLowerCase()?.replace(/\s+/g, ''),
			}
			done(null, user)
		} catch (error) {
			this.sharedService.sendError(error, this.validate.name)
		}
	}
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		return super.canActivate(context) as Promise<boolean>
	}
}
