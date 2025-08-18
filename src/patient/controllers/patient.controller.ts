import { Controller, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from 'src/utils/enums/response_messages.enum'
import { PatientService } from '../services/patient.service'
import { PatientsListingDTO } from 'src/patient/dtos/patients_listing.dto'

@ApiTags('patient')
@Controller('patient')
export class PatientController {

}

