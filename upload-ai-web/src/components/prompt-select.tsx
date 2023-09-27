import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api } from "@/lib/axios";

interface Prompt {
  id: string
  title: string
  template: string
}

interface PromptSelectedProps {
  onPromptSelected: (template: string) => void
}

export function PromptSelect(props: PromptSelectedProps) {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null)

  useEffect(() => {
    api.get('/prompts').then(response => {
      console.log(response.data);
      setPrompts(response.data)
    })
  }, [])

  function handlePromptSelected(promptId: string) {
    const selectecdPrompt = prompts?.find(prompt => prompt.id === promptId)

    if (!selectecdPrompt) {
      return
    }
    props.onPromptSelected(selectecdPrompt.template);
  }

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um prompt..." />
      </SelectTrigger>
      <SelectContent>
        {prompts?.map(prompt => {
          return (
            // no react, toda vez que há um map, o primeiro elemento precisa ter uma "key",que precisa ser uma informação única
            <SelectItem key={prompt.id} value={prompt.id}>
              {prompt.title}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
