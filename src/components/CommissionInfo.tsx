
import { useState, useEffect } from "react";
import { 
  AffiliateService, 
  CommissionTier, 
  UserProgression 
} from "@/services/AffiliateService";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CommissionInfoProps {
  userId: string;
}

const CommissionInfo = ({ userId }: CommissionInfoProps) => {
  const [tiers, setTiers] = useState<CommissionTier[]>([]);
  const [userProgression, setUserProgression] = useState<UserProgression | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextTier, setNextTier] = useState<CommissionTier | null>(null);
  const [progressToNextTier, setProgressToNextTier] = useState(0);

  useEffect(() => {
    const loadCommissionData = async () => {
      try {
        setLoading(true);
        // Load all tiers
        const { data: tiersData } = await AffiliateService.getCommissionTiers();
        
        // Load user progression
        const { data: progressionData } = await AffiliateService.getUserProgression(userId);
        
        if (tiersData) {
          setTiers(tiersData);
          
          // If we have user progression data
          if (progressionData) {
            setUserProgression(progressionData);
            
            // Find the current tier and next tier
            const currentTierIndex = tiersData.findIndex(t => t.id === progressionData.current_tier_id);
            if (currentTierIndex > -1 && currentTierIndex < tiersData.length - 1) {
              const currentTier = tiersData[currentTierIndex];
              const nextTierObj = tiersData[currentTierIndex + 1];
              setNextTier(nextTierObj);
              
              // Calculate progress to next tier
              if (nextTierObj.min_revenue > 0) {
                const totalRevenue = progressionData.total_revenue || 0;
                const minThreshold = currentTier.min_revenue;
                const maxThreshold = nextTierObj.min_revenue;
                const progress = ((totalRevenue - minThreshold) / (maxThreshold - minThreshold)) * 100;
                setProgressToNextTier(Math.min(Math.max(progress, 0), 100));
              }
            } else {
              // User is at max tier
              setProgressToNextTier(100);
            }
          }
        }
      } catch (error) {
        console.error("Error loading commission data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadCommissionData();
    }
    
    // Set up real-time updates for user progression
    const channel = supabase
      .channel('progression-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'user_progression', filter: `user_id=eq.${userId}` }, 
        async (payload) => {
          console.log('User progression updated:', payload);
          // Reload user progression data
          const { data } = await AffiliateService.getUserProgression(userId);
          if (data) {
            setUserProgression(data);
            
            // Recalculate progress to next tier
            if (tiers.length > 0) {
              const currentTierIndex = tiers.findIndex(t => t.id === data.current_tier_id);
              if (currentTierIndex > -1 && currentTierIndex < tiers.length - 1) {
                const currentTier = tiers[currentTierIndex];
                const nextTierObj = tiers[currentTierIndex + 1];
                setNextTier(nextTierObj);
                
                // Calculate progress to next tier
                if (nextTierObj.min_revenue > 0) {
                  const totalRevenue = data.total_revenue || 0;
                  const minThreshold = currentTier.min_revenue;
                  const maxThreshold = nextTierObj.min_revenue;
                  const progress = ((totalRevenue - minThreshold) / (maxThreshold - minThreshold)) * 100;
                  setProgressToNextTier(Math.min(Math.max(progress, 0), 100));
                }
              } else {
                // User is at max tier
                setProgressToNextTier(100);
                setNextTier(null);
              }
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-64" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Generate commission examples from tiers
  const tierExamples = AffiliateService.getCommissionExamples(tiers);

  // Get current tier info
  const currentTier = userProgression?.tier || tiers[0];

  return (
    <div className="space-y-6">
      {/* Tier progression card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Niveau de Commission</span>
            {currentTier && (
              <Badge 
                className="text-sm py-1 px-3"
                style={{ backgroundColor: currentTier.color }}
              >
                {currentTier.name}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {nextTier ? 
              `${Math.round(progressToNextTier)}% vers le niveau ${nextTier.name}` : 
              "Vous avez atteint le niveau maximum !"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress value={progressToNextTier} className="h-3" />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
            {tiers.map((tier, index) => (
              <div 
                key={tier.id} 
                className="relative"
                style={{ 
                  left: `${index === 0 ? '0' : index === tiers.length - 1 ? '0' : ''}`,
                  right: `${index === tiers.length - 1 ? '0' : ''}`,
                  marginLeft: `${index === 0 ? '0' : index === tiers.length - 1 ? 'auto' : ''}`,
                }}
              >
                <div 
                  className={`h-3 w-3 rounded-full mb-1 mx-auto ${userProgression?.current_tier_id === tier.id ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  style={{ backgroundColor: tier.color }}
                ></div>
                <span className="text-[10px] font-medium">{tier.name}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">Chiffre d'affaires généré</p>
              <p className="text-2xl font-bold">{userProgression?.total_revenue?.toLocaleString('fr-FR')}€</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Commission totale</p>
              <p className="text-2xl font-bold">{userProgression?.total_commission?.toLocaleString('fr-FR')}€</p>
            </div>
          </div>
          
          {nextTier && (
            <div className="mt-4 bg-muted/50 p-3 rounded-lg flex items-center text-sm">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              <span>
                Prochain palier : {nextTier.name} à partir de {nextTier.min_revenue.toLocaleString('fr-FR')}€ 
                ({nextTier.commission_rate}% de commission)
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Commission table */}
      <Card>
        <CardHeader>
          <CardTitle>Barème de Commission</CardTitle>
          <CardDescription>Notre programme de commission par paliers de vente</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Palier de vente</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Exemple</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tierExamples.map(({ tier, examples }) => (
                <TableRow 
                  key={tier.id}
                  className={userProgression?.current_tier_id === tier.id ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div 
                        className="h-3 w-3 rounded-full mr-2"
                        style={{ backgroundColor: tier.color }}
                      ></div>
                      <span>{tier.name} : {tier.min_revenue.toLocaleString('fr-FR')}€
                      {tier.max_revenue !== null ? ` - ${tier.max_revenue.toLocaleString('fr-FR')}€` : ' et plus'}</span>
                      {userProgression?.current_tier_id === tier.id && (
                        <Badge variant="outline" className="ml-2 text-[10px] py-0">Actuel</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">{tier.commission_rate}%</TableCell>
                  <TableCell className="text-right">
                    {examples.map((example, i) => (
                      <div key={i}>
                        <div>{example.description}</div>
                        <div className="font-medium text-primary">→ {example.commission.toLocaleString('fr-FR')}€ de commission</div>
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionInfo;
