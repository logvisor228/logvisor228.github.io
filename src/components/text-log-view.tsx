"use client";

import { useMemo, useState } from 'react';
import { TextEntry, LogEntry } from '@/types/logs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { FileText, PlusCircle, MinusCircle } from 'lucide-react';

interface TextEdit {
    text: string;
    change: 'add' | 'remove';
    timestamp: number;
}

interface TypingBlock {
  package: string;
  entries: TextEntry[];
  edits: TextEdit[];
  startTimestamp: number;
  endTimestamp: number;
}

interface GroupedText {
  package: string;
  blocks: TypingBlock[];
  startTimestamp: number;
}

const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).replace(',', '');
};

const processTextEntries = (entries: TextEntry[]): TypingBlock[] => {
  if (!entries.length) return [];

  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  const blocks: TypingBlock[] = [];
  let currentBlock: TypingBlock | null = null;
  const TYPING_TIMEOUT = 5000; // 5 секунд

  for (const entry of sortedEntries) {
    if (!currentBlock) {
      currentBlock = {
        package: entry.package,
        entries: [entry],
        edits: [],
        startTimestamp: entry.timestamp,
        endTimestamp: entry.timestamp,
      };
      continue;
    }

    const timeDiff = entry.timestamp - currentBlock.endTimestamp;
    
    if (entry.package !== currentBlock.package || timeDiff > TYPING_TIMEOUT) {
      if (currentBlock.entries.length > 0) {
        blocks.push(currentBlock);
      }
      
      currentBlock = {
        package: entry.package,
        entries: [entry],
        edits: [],
        startTimestamp: entry.timestamp,
        endTimestamp: entry.timestamp,
      };
    } else {
      currentBlock.entries.push(entry);
      currentBlock.endTimestamp = entry.timestamp;
    }
  }

  if (currentBlock && currentBlock.entries.length > 0) {
    blocks.push(currentBlock);
  }

  for (const block of blocks) {
    const edits: TextEdit[] = [];
    if (block.entries.length < 2) {
      if (block.entries.length === 1 && block.entries[0].text.trim() !== '') {
          edits.push({text: block.entries[0].text, change: 'add', timestamp: block.entries[0].timestamp });
      }
      block.edits = edits;
      continue;
    }

    let lastText = '';
    let isTyping = true; 

    for (let i = 0; i < block.entries.length; i++) {
        const currentEntry = block.entries[i];
        const currentText = currentEntry.text;
        
        const isCurrentlyTyping = currentText.length > lastText.length;
        
        if (i > 0) {
          if (isTyping && !isCurrentlyTyping) { // Switched from typing to deleting
              edits.push({ text: lastText, change: 'add', timestamp: block.entries[i - 1].timestamp });
              isTyping = false;
          } else if (!isTyping && isCurrentlyTyping) { // Switched from deleting to typing
              edits.push({ text: lastText, change: 'remove', timestamp: block.entries[i - 1].timestamp });
              isTyping = true;
          }
        }
        
        lastText = currentText;

        // Add the last action if it's the end of the block
        if (i === block.entries.length - 1) {
            edits.push({ text: currentText, change: isTyping ? 'add' : 'remove', timestamp: currentEntry.timestamp });
        }
    }

    // Filter out consecutive duplicates with the same text
    block.edits = edits.filter((edit, index, self) => 
        index === 0 || edit.text !== self[index - 1].text || edit.change !== self[index-1].change
    ).filter(e => e.text.trim() !== "" || (e.text.trim() === "" && e.change === 'remove'));
  }

  return blocks.filter(b => b.edits.length > 0);
};


export default function TextLogView({ textEntries, onSelectEvent }: {
    textEntries: TextEntry[];
    onSelectEvent: (event: LogEntry) => void;
}) {
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);

  const groupedTexts: GroupedText[] = useMemo(() => {
    const blocks = processTextEntries(textEntries);
    if (blocks.length === 0) return [];
    
    const groupsByPackage: { [key: string]: GroupedText } = {};

    for (const block of blocks) {
        if(block.edits.length === 0) continue;
      if (!groupsByPackage[block.package]) {
        groupsByPackage[block.package] = {
          package: block.package,
          blocks: [],
          startTimestamp: block.startTimestamp,
        };
      }
      groupsByPackage[block.package].blocks.push(block);
      if(block.startTimestamp < groupsByPackage[block.package].startTimestamp) {
         groupsByPackage[block.package].startTimestamp = block.startTimestamp;
      }
    }
    
    return Object.values(groupsByPackage).sort((a, b) => b.startTimestamp - a.startTimestamp);
  }, [textEntries]);

  const handleSelect = (entry: TextEntry) => {
    setSelectedTimestamp(entry.timestamp);
    onSelectEvent(entry);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Текстовые логи</CardTitle>
        <CardDescription>Сгруппированные сессии набора текста с историей изменений.</CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-8rem)] p-6 pt-0">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {groupedTexts.map(group => (
              <Card
                key={group.startTimestamp}
                className={cn(
                  "transition-all",
                  group.blocks.some(b => b.entries.some(e => e.timestamp === selectedTimestamp))
                    ? "border-primary ring-2 ring-primary"
                    : "hover:border-primary/50"
                )}
              >
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="text-primary"/>
                    {group.package}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.blocks.map(block => (
                     <div
                        key={block.startTimestamp}
                        onClick={() => handleSelect(block.entries[block.entries.length - 1])}
                        className={cn("cursor-pointer p-3 rounded-md space-y-1", 
                            block.entries.some(e => e.timestamp === selectedTimestamp)
                             ? "bg-primary/20" 
                             : "hover:bg-muted"
                        )}
                      >
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-muted-foreground">
                                {formatTimestamp(block.startTimestamp)} - {formatTimestamp(block.endTimestamp)}
                            </p>
                       </div>
                       <div className='space-y-1'>
                        {block.edits.map((edit, index) => (
                           <div key={index} className="flex items-start gap-2">
                            {edit.change === 'add' ? <PlusCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5"/> : <MinusCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5"/>}
                            <p className={cn("whitespace-pre-wrap font-mono text-sm", edit.text.trim() === "" && "italic text-muted-foreground")}>
                                {`"${edit.text.trim() === "" ? "[пусто]" : edit.text}"`}
                            </p>
                           </div>
                        ))}
                       </div>
                     </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </>
  );
}
