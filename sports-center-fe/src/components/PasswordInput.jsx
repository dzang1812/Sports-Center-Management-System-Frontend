import { useState } from 'react'
import { Icon, inputCls } from './ui'

export default function PasswordInput({ className = '', ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className={`${inputCls} pr-10 ${className}`} />
      <button
        type="button"
        aria-label="Hiện hoặc ẩn mật khẩu"
        onClick={() => setShow(!show)}
        className="absolute right-2.5 top-2.5 text-outline hover:text-on-surface p-0.5 rounded"
      >
        <Icon name={show ? 'visibility' : 'visibility_off'} className="text-xl" />
      </button>
    </div>
  )
}
