import { ChevronUp, ChevronDown } from 'lucide-react'
import '../styles/NumberStepper.css'

function NumberStepper({
  name,
  value,
  onChange,
  min,
  max,
  step = 1,
  required = false,
  placeholder,
  className = '',
}) {
  const numValue = value === '' || value === undefined ? NaN : Number(value)
  const canStepUp = max === undefined || Number.isNaN(numValue) || numValue < max
  const canStepDown = min === undefined || Number.isNaN(numValue) || numValue > min

  const handleInputChange = (e) => {
    onChange(e)
  }

  const stepUp = () => {
    const base = !Number.isNaN(numValue) ? numValue : (min ?? 0)
    const next = base + step
    const clamped = max !== undefined ? Math.min(next, max) : next
    onChange({ target: { name, value: clamped } })
  }

  const stepDown = () => {
    const base = !Number.isNaN(numValue) ? numValue : (min ?? 0)
    const next = base - step
    const clamped = min !== undefined ? Math.max(next, min) : next
    onChange({ target: { name, value: clamped } })
  }

  return (
    <div className={`number-stepper ${className}`}>
      <input
        type="number"
        name={name}
        value={value === '' ? '' : value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        required={required}
        placeholder={placeholder}
        className="number-stepper__input"
      />
      <div className="number-stepper__arrows">
        <button
          type="button"
          className="number-stepper__btn number-stepper__btn--up"
          onClick={stepUp}
          disabled={!canStepUp}
          aria-label="Increase value"
        >
          <ChevronUp size={16} aria-hidden />
        </button>
        <button
          type="button"
          className="number-stepper__btn number-stepper__btn--down"
          onClick={stepDown}
          disabled={!canStepDown}
          aria-label="Decrease value"
        >
          <ChevronDown size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}

export default NumberStepper
