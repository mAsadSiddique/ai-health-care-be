import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('patient')
@Controller('patient')
export class PatientController {
    // Patient-specific endpoints will be added here in the future
}

