import { useState, useRef, useCallback, useEffect } from 'react'

// The Web Speech API isn't in TypeScript's default types, so we declare
// just enough of it here to use it safely.
interface SpeechRecognitionResult {
  transcript: string
}
interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: SpeechRecognitionResult; isFinal: boolean }; length: number }
}

export function useVoiceInput(onFinalTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<any>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalChunk = ''
      let interimChunk = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalChunk += result[0].transcript
        } else {
          interimChunk += result[0].transcript
        }
      }
      if (finalChunk) onFinalTranscript(finalChunk)
      setInterimText(interimChunk)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setInterimText('')
    recognitionRef.current.start()
    setIsListening(true)
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setIsListening(false)
  }, [])

  return { isSupported, isListening, interimText, startListening, stopListening }
}
