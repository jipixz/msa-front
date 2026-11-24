import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Thermometer, Droplets, CloudRain, Leaf } from 'lucide-react'
import { PredictionData } from '../../types/prediction.types'
import { OPTIMAL_TEMPERATURE, OPTIMAL_HUMIDITY, OPTIMAL_SOIL_MOISTURE } from '../../config/constants'
import { formatDayLabel } from '../../utils/formatters'

interface PredictionChartsProps {
  temperatureData: PredictionData | null
  humidityData: PredictionData | null
  rainfallData: PredictionData | null
  soilMoistureData: PredictionData | null
  activeTab: string
}

export const PredictionCharts: React.FC<PredictionChartsProps> = ({
  temperatureData,
  humidityData,
  rainfallData,
  soilMoistureData,
  activeTab
}) => {
  if (activeTab === 'overview') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Temperatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-warn" />
              Predicción de Temperatura
              <Badge variant="outline" className="ml-auto text-xs">
                7 días
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureData?.predictions || []}>
                  <XAxis dataKey="day" tickFormatter={formatDayLabel} />
                  <YAxis domain={[25, 40]} />
                  <ReferenceLine y={OPTIMAL_TEMPERATURE} stroke="hsl(var(--ok))" strokeDasharray="5 5" label="Óptimo Cacao" />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--warn))"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: "hsl(var(--warn))", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--bad))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--bad))", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Humedad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-info" />
              Predicción de Humedad
              <Badge variant="outline" className="ml-auto text-xs">
                7 días
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={humidityData?.predictions || []}>
                  <XAxis dataKey="day" tickFormatter={formatDayLabel} />
                  <YAxis domain={[40, 100]} />
                  <ReferenceLine y={OPTIMAL_HUMIDITY} stroke="hsl(var(--ok))" strokeDasharray="5 5" label="Óptimo Cacao" />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activeTab === 'climate') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Temperatura detallado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-warn" />
              Temperatura Detallada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureData?.predictions || []}>
                  <XAxis dataKey="day" tickFormatter={formatDayLabel} />
                  <YAxis domain={[20, 40]} />
                  <ReferenceLine y={OPTIMAL_TEMPERATURE} stroke="hsl(var(--ok))" strokeDasharray="5 5" label="Óptimo Cacao" />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--warn))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--warn))", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--bad))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--bad))", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Lluvia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-info" />
              Predicción de Lluvia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rainfallData?.predictions || []}>
                  <XAxis dataKey="day" tickFormatter={formatDayLabel} />
                  <YAxis />
                  <Bar dataKey="predicted" fill="hsl(var(--info))" />
                  <Bar dataKey="probability" fill="hsl(var(--info))" fillOpacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activeTab === 'soil') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-ok" />
            Humedad del Suelo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={soilMoistureData?.predictions || []}>
                <XAxis dataKey="day" tickFormatter={formatDayLabel} />
                <YAxis domain={[20, 80]} />
                <ReferenceLine y={OPTIMAL_SOIL_MOISTURE} stroke="hsl(var(--ok))" strokeDasharray="5 5" label="Óptimo Cacao" />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--ok))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--ok))", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--ok))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--ok))", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}