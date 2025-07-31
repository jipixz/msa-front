import React from 'react'
import { useTimeAgo } from '../../hooks/useTimeAgo'

interface TimeAgoProps {
  date: Date | null
  className?: string
}

export const TimeAgo: React.FC<TimeAgoProps> = ({ date, className = "text-xs text-gray-500" }) => {
  const timeAgoText = useTimeAgo(date)
  
  if (!date || !timeAgoText) return null
  
  return (
    <span className={className}>
      {timeAgoText}
    </span>
  )
}