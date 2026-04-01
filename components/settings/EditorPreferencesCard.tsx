"use client";

import { useEditorPreferences } from "@/components/settings/EditorPreferencesContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function EditorPreferencesCard() {
  const { preferences, setPreference } = useEditorPreferences();

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-base">Editor Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Theme</Label>
            <p className="text-sm text-muted-foreground">Select the default editor theme.</p>
          </div>
          <Select value={preferences.theme} onValueChange={(val: string | null) => { if (val) setPreference("theme", val); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vs-dark">VS Dark</SelectItem>
              <SelectItem value="vs-light">VS Light</SelectItem>
              <SelectItem value="hc-black">High Contrast Base</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Font Size</Label>
            <p className="text-sm text-muted-foreground">Adjust the code font size.</p>
          </div>
          <Select value={String(preferences.fontSize)} onValueChange={(val: string | null) => { if (val) setPreference("fontSize", parseInt(val, 10)); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="13">13px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="15">15px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Tab Size</Label>
            <p className="text-sm text-muted-foreground">Number of spaces per tab.</p>
          </div>
          <Select value={String(preferences.tabSize)} onValueChange={(val: string | null) => { if (val) setPreference("tabSize", parseInt(val, 10)); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 spaces</SelectItem>
              <SelectItem value="4">4 spaces</SelectItem>
              <SelectItem value="8">8 spaces</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Word Wrap</Label>
            <p className="text-sm text-muted-foreground">Wrap long lines to fit the editor width.</p>
          </div>
          <Switch 
            checked={preferences.wordWrap === "on"} 
            onCheckedChange={(checked: boolean) => setPreference("wordWrap", checked ? "on" : "off")} 
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Minimap</Label>
            <p className="text-sm text-muted-foreground">Show code overview on the right.</p>
          </div>
          <Switch 
            checked={preferences.minimap} 
            onCheckedChange={(checked: boolean) => setPreference("minimap", checked)} 
          />
        </div>

      </CardContent>
    </Card>
  );
}
