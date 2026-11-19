'use client'

import type { ComponentPropsWithRef } from 'react'

type FlowButtonProps = ComponentPropsWithRef<'button'> & { text?: string }
type FlowLinkProps = ComponentPropsWithRef<'a'> & { text?: string }

// Shared with static site controls through src/flow-button.css.
// Decorative arrows are omitted to follow the project's design preference.
export function FlowButton({ text = 'Modern Button', children, className = '', type = 'button', ...props }: FlowButtonProps) {
  return (
    <button {...props} type={type} className={`flow-button group relative inline-flex items-center justify-center overflow-hidden rounded-[100px] ${className}`}>
      <span className="flow-button-content relative z-[1] inline-flex items-center justify-center gap-2">{children ?? text}</span>
    </button>
  )
}

export function FlowLink({ text, children, className = '', ...props }: FlowLinkProps) {
  return (
    <a {...props} className={`flow-button group relative inline-flex items-center justify-center overflow-hidden rounded-[100px] ${className}`}>
      <span className="flow-button-content relative z-[1] inline-flex items-center justify-center gap-2">{children ?? text}</span>
    </a>
  )
}
