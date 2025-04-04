import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const OutputPanel = () => {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full items-center justify-center">
        <span className="font-semibold">Output/Preview</span>
      </CardContent>
    </Card>
  );
};