import { ProjectTabs } from '@/components/projects/ProjectTabs';
import { NewEstimateButton } from '../../../components/projects/NewEstimateButton';

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Project {projectId}</h1>
      <div className="mt-4 flex justify-end"><NewEstimateButton projectId={projectId} /></div>
      <div className="mt-6"><ProjectTabs projectId={projectId} /></div>
    </div>
  );
}
