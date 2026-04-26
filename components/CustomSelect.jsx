import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import '../styles/CustomSelect.css'

function CustomSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  required = false,
  className = '',
  id,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef(null)

  const optionsList = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )
  const selectedOption = optionsList.find((o) => o.value === value)
  const displayValue = selectedOption ? selectedOption.label : ''

  const close = () => {
    setIsOpen(false)
    setHighlightIndex(-1)
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      const idx = optionsList.findIndex((o) => o.value === value)
      setHighlightIndex(idx >= 0 ? idx : 0)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, value, optionsList.length])

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIndex((i) => (i < optionsList.length - 1 ? i + 1 : 0))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIndex((i) => (i > 0 ? i - 1 : optionsList.length - 1))
        return
      }
      if (e.key === 'Enter' && highlightIndex >= 0 && optionsList[highlightIndex]) {
        e.preventDefault()
        handleSelect(optionsList[highlightIndex].value)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, highlightIndex, optionsList])

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } })
    close()
  }

  useEffect(() => {
    if (isOpen) {
      close()
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      className={`custom-select ${isOpen ? 'custom-select--open' : ''} ${className}`}
    >
      <button
        type="button"
        className="custom-select__trigger"
        onClick={() => setIsOpen((o) => !o)}
        onBlur={() => {}}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id}
        data-value={value || ''}
      >
        <span className="custom-select__value">
          {displayValue || <span className="custom-select__placeholder">{placeholder}</span>}
        </span>
        <ChevronDown size={18} className="custom-select__chevron" aria-hidden />
      </button>
      <input
        type="hidden"
        name={name}
        value={value || ''}
        required={required}
        readOnly
        tabIndex={-1}
        aria-hidden
      />
      <div
        className="custom-select__panel"
        role="listbox"
        aria-activedescendant={optionsList[highlightIndex] ? `opt-${highlightIndex}` : undefined}
      >
        {optionsList.map((opt, i) => (
          <div
            key={opt.value}
            id={`opt-${i}`}
            role="option"
            aria-selected={value === opt.value}
            className={`custom-select__option ${value === opt.value ? 'custom-select__option--selected' : ''} ${i === highlightIndex ? 'custom-select__option--highlight' : ''}`}
            onMouseEnter={() => setHighlightIndex(i)}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleSelect(opt.value)
            }}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomSelect
