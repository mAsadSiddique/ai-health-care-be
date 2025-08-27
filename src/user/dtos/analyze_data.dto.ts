import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNotEmptyObject } from "class-validator";

export interface HealthAssessmentResult {
    health_status: string;
    confidence_score: number;
    suggested_action: string;
    prediction_details: any;
    risk_summary: any;
}

export interface AnalyzeResultData {
    general_health_assessment: HealthAssessmentResult;
    comprehensive_cvd_assessment: any;
    combined_meta: any;
}

export interface AnalyzeResult {
    success: boolean;
    message: string;
    data: AnalyzeResultData;
    error_code: string | null;
}

export class AnalyzeDataDTO {
    @ApiPropertyOptional({
        description: 'Analyze data payload',
        example: {
            "heart_rate": 56,
            "temperature": 36.8,
            "spo2": 98,
            "age": 35,
            "blood_pressure_systolic": 180,
            "blood_pressure_diastolic": 100,
            "cholesterol": 230
        }
    })
    @IsNotEmpty()
    @IsNotEmptyObject({ nullable: false })
    analyzingData: any

    @ApiPropertyOptional({
        description: 'Analyzed result',
        example: {
            "success": true,
            "message": "Complete health assessment completed successfully",
            "data": {
                "general_health_assessment": {
                    "health_status": "Critical",
                    "confidence_score": 1.0,
                    "suggested_action": "Seek immediate medical attention",
                    "prediction_details": {
                        "model_used": "random_forest",
                        "prediction_time_ms": 26.56,
                        "features": {
                            "heart_rate": 56.0,
                            "temperature": 36.8,
                            "spo2": 98.0,
                            "age": 35,
                            "blood_pressure": "180.0/100.0",
                            "cholesterol": 230.0
                        }
                    },
                    "risk_summary": {
                        "risk_level": "Moderate",
                        "risk_percentage": 14.6,
                        "major_risk_factors": [
                            "Hypertension"
                        ]
                    }
                },
                "comprehensive_cvd_assessment": {
                    "risk_level": "Moderate",
                    "risk_percentage": 14.6,
                    "confidence_score": 1.0,
                    "risk_factors": [
                        {
                            "factor": "Hypertension",
                            "severity": "Major",
                            "value": "180.0/100.0 mmHg",
                            "target": "<120/80 mmHg",
                            "modifiable": true
                        }
                    ],
                    "recommendations": [
                        "👨‍⚕️ Discuss cardiovascular risk with your primary care physician",
                        "📋 Consider preventive cardiology consultation",
                        "🩺 Monitor blood pressure daily and maintain a log",
                        "🧂 Reduce sodium intake to <2,300mg per day",
                        "💊 Discuss blood pressure medications with your doctor",
                        "🚭 If you smoke, seek help to quit immediately"
                    ],
                    "risk_scores": {
                        "traditional": {
                            "score": 5,
                            "level": "moderate",
                            "factors": [
                                "Hypertension (≥140/90 mmHg)",
                                "Borderline high cholesterol"
                            ]
                        },
                        "framingham": {
                            "percentage": 4.3,
                            "level": "low",
                            "note": "Simplified calculation without HDL/smoking data"
                        },
                        "ai_based": {
                            "percentage": 25.0,
                            "level": "high",
                            "confidence": 1.0,
                            "ml_based": true
                        }
                    },
                    "processing_time_ms": 20.2
                },
                "combined_meta": {
                    "api_version": "1.0.0",
                    "total_processing_time_ms": 46.84,
                    "assessment_timestamp": 1755716193.181141,
                    "models_used": {
                        "general_health": "random_forest",
                        "cvd_assessment": "multi_method_combined"
                    },
                    "input_parameters": {
                        "heart_rate": 56.0,
                        "temperature": 36.8,
                        "spo2": 98.0,
                        "age": 35,
                        "blood_pressure": "180.0/100.0",
                        "cholesterol": 230.0
                    }
                }
            },
            "error_code": null
        }
    })
    @IsNotEmpty()
    @IsNotEmptyObject({ nullable: false })
    analyzingResult: AnalyzeResult
}

export class DoctorAnalyzeDataDTO extends AnalyzeDataDTO {
    @ApiProperty({
        description: 'patient id',
        type: String,
        example: '507f1f77bcf86cd799439011',
        required: true
    })
    @IsNotEmpty()
    @IsMongoId({
        message: 'patientId must be a valid 24-character hex MongoDB ObjectId',
    })
    patientId: string
}