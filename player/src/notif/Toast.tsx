import { useEffect, useState } from 'react'
import './toast.css'

interface ToastProps {
    id: string
    message: string
    onDismiss: (id: string) => void
}

export function Toast({ id, message, onDismiss }: ToastProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true))
    }, [])


    return (
        <div className={`toast ${visible ? 'toast--in' : ''}`}>
            <p className="toast__msg">{message}</p>
        </div>
    )
}

export default Toast
