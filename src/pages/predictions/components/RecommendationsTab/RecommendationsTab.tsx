import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { AlertsData } from '../../types/prediction.types'

interface RecommendationsTabProps {
  alertsData: AlertsData | null
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({ alertsData }) => {
  if (!alertsData?.alerts || alertsData.alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No hay alertas activas
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Las condiciones actuales son favorables para el cultivo de cacao.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {alertsData.alerts.map((alert, index) => {
        const isWarning = alert.type === 'warning'
        const severity = alert.severity || (isWarning ? 'warning' : 'favorable')
        
        return (
          <Alert 
            key={index}
            className={`
              border-2 rounded-lg shadow-sm
              ${
                severity === 'warning' 
                  ? 'border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/50' 
                  : 'border-green-200 bg-green-50/80 dark:border-green-800 dark:bg-green-950/50'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {severity === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`
                  font-semibold text-base mb-2
                  ${
                    severity === 'warning' 
                      ? 'text-amber-800 dark:text-amber-200' 
                      : 'text-green-800 dark:text-green-200'
                  }
                `}>
                  {alert.title || (alert.type === 'temperature' ? 'Alerta de Temperatura:' : 'Condiciones Favorables:')}
                </h4>
                <AlertDescription className={`
                  text-sm leading-relaxed
                  ${
                    severity === 'warning' 
                      ? 'text-amber-700 dark:text-amber-300' 
                      : 'text-green-700 dark:text-green-300'
                  }
                `}>
                  <p className="mb-3">{alert.message}</p>
                  
                  {(alert.recommendations && alert.recommendations.length > 0) && (
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Recomendaciones:
                      </p>
                      <ul className="space-y-2 ml-0">
                        {alert.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className={`
                              inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                              ${
                                severity === 'warning' 
                                  ? 'bg-amber-600 dark:bg-amber-400' 
                                  : 'bg-green-600 dark:bg-green-400'
                              }
                            `}></span>
                            <span className="text-sm leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {alert.recommendation && (
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Recomendación:
                      </p>
                      <div className="flex items-start gap-2">
                        <span className={`
                          inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                          ${
                            severity === 'warning' 
                              ? 'bg-amber-600 dark:bg-amber-400' 
                              : 'bg-green-600 dark:bg-green-400'
                          }
                        `}></span>
                        <span className="text-sm leading-relaxed">{alert.recommendation}</span>
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )
      })}
    </div>
  )
}