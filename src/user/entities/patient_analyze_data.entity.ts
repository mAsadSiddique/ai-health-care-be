import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatientAnalyzeDataDocument = PatientAnalyzeData & Document;

@Schema({ timestamps: true })
export class PatientAnalyzeData {
    _id: Types.ObjectId;

    @Prop({ type: Object, required: true })
    analyzingData: any

    @Prop({ type: Object, required: true })
    analyzingResult: any

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    patientDoctorId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    patientId: Types.ObjectId;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    constructor(obj?) {
        if (obj) {
            Object.assign(this, obj)
        }
    }
}

export const PatientAnalyzeDataSchema =
    SchemaFactory.createForClass(PatientAnalyzeData);
