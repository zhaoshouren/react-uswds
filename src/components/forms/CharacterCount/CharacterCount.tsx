import React, { useState, useEffect } from 'react'
import classnames from 'classnames'

import { TextInput, TextInputProps } from '../TextInput/TextInput'
import { Textarea, TextareaProps } from '../Textarea/Textarea'

/* Defaults
  This is a fallback for character count and validation message.
  In many cases, though, props will be passed in by consumer 
  for example, to account for i18n-aware strings
*/
const defaultCharacterCount = (text: string): number => Array.from(text).length
const defaultMessage = (count: number, max: number): string => {
  const emptyMessageFormat = `${max} characters allowed`
  const remainingPluralFormat = '$0 characters left'
  const remainingSingularFormat = '$0 character left'
  const overSingularFormat = '$0 character over limit'
  const overPluralFormat = '$0 characters over limit'
  const remainingCount = max - count

  switch (remainingCount) {
    case max:
      return emptyMessageFormat
    case 1:
      return remainingSingularFormat.replace('$0', '1')
    case -1:
      return overSingularFormat.replace('$0', '1')
    default:
      return remainingCount >= 0
        ? remainingPluralFormat.replace('$0', remainingCount.toString())
        : overPluralFormat.replace('$0', Math.abs(remainingCount).toString())
  }
}

/* Types */
type BaseCharacterCountProps = {
  id: string
  name: string
  maxLength: number
  value?: string
  defaultValue?: string
  className?: string
  isTextArea?: boolean
  getCharacterCount?: (text: string) => number
  getMessage?: (remainingCount: number, max: number) => string
}

export type TextInputCharacterCountProps = BaseCharacterCountProps &
  TextInputProps

export type TextareaCharacterCountProps = BaseCharacterCountProps &
  TextareaProps &
  JSX.IntrinsicElements['textarea']

/* Main */
export const CharacterCount = ({
  id,
  name,
  className,
  maxLength,
  value = '',
  defaultValue = '',
  isTextArea = false,
  getCharacterCount = defaultCharacterCount,
  getMessage = defaultMessage,
  ...remainingProps
}:
  | TextInputCharacterCountProps
  | TextareaCharacterCountProps): React.ReactElement => {
  const initialCount = getCharacterCount(value || defaultValue)
  const [length, setLength] = useState(initialCount)
  const [message, setMessage] = useState(getMessage(initialCount, maxLength))
  const [isValid, setIsValid] = useState(initialCount < maxLength)

  const classes = classnames('usa-character-count__field', className)
  const messageClasses = classnames(
    'usa-hint',
    'usa-character-count__message',
    { 'usa-character-count__message--invalid': !isValid }
  )

  useEffect(() => {
    setMessage(getMessage(length, maxLength))
    setIsValid(length <= maxLength)
  }, [length])

  const handleBlur = (
    e:
      | React.FocusEvent<HTMLInputElement>
      | React.FocusEvent<HTMLTextAreaElement>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback?: (e: any) => void
  ): void => {
    const validationMessage = !isValid ? 'The content is too long.' : ''
    e.target.setCustomValidity(validationMessage)
    if (callback) callback(e)
  }

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback?: (e: any) => void
  ): void => {
    const {
      target: { value = '' },
    } = e
    setLength(getCharacterCount(value))

    if (callback) callback(e)
  }

  let InputComponent: React.ReactElement
  if (isTextArea) {
    const { onBlur, onChange, inputRef, ...textAreaProps } =
      remainingProps as Partial<TextareaCharacterCountProps>

    const attributes = {
      id: id,
      name: name,
      className: classes,
      ...(value ? { value: value } : { defaultValue: defaultValue }),
      onBlur: (e: React.FocusEvent<HTMLTextAreaElement, Element>): void =>
        handleBlur(e, onBlur),
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>): void =>
        handleChange(e, onChange),
      inputRef: inputRef,
      ...textAreaProps,
    }
    InputComponent = <Textarea {...attributes} />
  } else {
    const {
      onBlur,
      onChange,
      inputRef,
      type = 'text',
      ...inputProps
    } = remainingProps as Partial<TextInputCharacterCountProps>
    const attributes = {
      id: id,
      type: type,
      name: name,
      className: classes,
      ...(value ? { value: value } : { defaultValue: defaultValue }),
      onBlur: (e: React.FocusEvent<HTMLInputElement, Element>): void =>
        handleBlur(e, onBlur),
      onChange: (e: React.ChangeEvent<HTMLInputElement>): void =>
        handleChange(e, onChange),
      inputRef: inputRef,
      ...inputProps,
    }
    InputComponent = <TextInput {...attributes} />
  }

  return (
    <>
      {InputComponent}
      <span
        data-testid="characterCountMessage"
        id={`${id}-info`}
        className={messageClasses}
        aria-live="polite">
        {message}
      </span>
    </>
  )
}

export default CharacterCount
