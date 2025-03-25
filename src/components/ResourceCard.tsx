
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface ResourceCardProps {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  link?: string;
  downloadable?: boolean;
}

const ResourceCard = ({
  title,
  description,
  imageUrl,
  category,
  link,
  downloadable = false,
}: ResourceCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg card-hover h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <div
          className="w-full h-full bg-center bg-cover transition-transform duration-500 hover:scale-105"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 text-xs font-medium bg-white text-brand-purple rounded-full">
            {category}
          </span>
        </div>
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600">{description}</p>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        {downloadable ? (
          <Button asChild variant="outline" className="w-full">
            <a href={link} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" />
              Je télécharge
            </a>
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-full">
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir la ressource
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;
