import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const DailyBonusCard: React.FC = () => {
  const handleClaim = () => {
    // TODO: Implement claim bonus functionality
  };

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Daily Bonus</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            0 UNI
          </div>
          <Button 
            onClick={handleClaim}
            disabled={true}
          >
            Claim Bonus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyBonusCard;