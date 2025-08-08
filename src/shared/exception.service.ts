import {
	Injectable,
	NotAcceptableException,
	NotFoundException,
	InternalServerErrorException,
	ConflictException,
	UnprocessableEntityException,
	BadRequestException,
	ForbiddenException,
	UnauthorizedException,
} from '@nestjs/common'

@Injectable()
export class ExceptionService {
	sendNotAcceptableException(message: string): never {
		throw new NotAcceptableException(message)
	}

	sendNotFoundException(message: string): never {
		throw new NotFoundException(message)
	}

	sendInternalServerErrorException(message: string): never {
		throw new InternalServerErrorException(message)
	}

	sendConflictException(message: string): never {
		throw new ConflictException(message)
	}

	sendUnprocessableEntityException(message: string): never {
		throw new UnprocessableEntityException(message)
	}

	sendBadRequestException(message: string): never {
		throw new BadRequestException(message)
	}

	sendForbiddenException(message: string): never {
		throw new ForbiddenException(message)
	}

	sendUnauthorizedException(message: string): never {
		throw new UnauthorizedException(message)
	}
}
