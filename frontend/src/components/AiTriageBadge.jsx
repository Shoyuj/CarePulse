import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

export default function AiTriageBadge({ urgency }) {
  if (!urgency) return null;

  const level = urgency.toUpperCase();

  let badgeClass = 'badge-medium';
  let icon = <AlertCircle size={14} />;
  let label = level;

  switch (level) {
    case 'LOW':
      badgeClass = 'badge-low';
      icon = <CheckCircle size={14} />;
      label = 'Low Urgency';
      break;
    case 'MEDIUM':
      badgeClass = 'badge-medium';
      icon = <AlertCircle size={14} />;
      label = 'Standard Care';
      break;
    case 'HIGH':
      badgeClass = 'badge-high';
      icon = <AlertTriangle size={14} />;
      label = 'High Priority';
      break;
    case 'EMERGENCY':
      badgeClass = 'badge-emergency';
      icon = <Flame size={14} />;
      label = '🚨 Urgent / ER';
      break;
    default:
      badgeClass = 'badge-medium';
      icon = <AlertCircle size={14} />;
      label = urgency;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
