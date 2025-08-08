import { Module } from '@nestjs/common'
import { ExceptionService } from './exception.service'
import { SharedService } from './shared.service'

@Module({
	imports: [],
	providers: [ExceptionService, SharedService],
	exports: [ExceptionService, SharedService],
})
export class SharedModule {}
