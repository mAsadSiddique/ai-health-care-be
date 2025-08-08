import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from './utils/enums/response_messages.enum'

@ApiBearerAuth('JWT')
@ApiTags('app')
@Controller('/')
export class AppController {
	constructor(private readonly appService: AppService) {}

	@ApiOkResponse({
		description: RESPONSE_MESSAGES.SUCCESS,
		type: String,
	})
	@ApiOperation({
		description: 'This is default api of app ',
	})
	@Get()
	getHello(): string {
		return this.appService.getHello()
	}
}
