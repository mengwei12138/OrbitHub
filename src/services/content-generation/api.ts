import request from '@/api/request';

import type {
  AvatarAssetDto,
  CreditsBalanceDto,
  CreditsLogQuery,
  ImageGenerationTaskDto,
  ImageGenerationTaskStatusDto,
  PageDataCreditsLog,
  PromptRefineRequest,
  PromptRefineResult,
  QueueCountDto,
  SubmitImageGenerationRequest,
  SubmitVideoGenerationRequest,
  TrialQuotaDto,
  VideoGenerationTaskDto,
  VideoTaskStatusDto,
  WorkDetailDto,
} from './types';

const API_PREFIX = '/api/v1/content-generation';

export async function fetchTrialQuota(): Promise<TrialQuotaDto> {
  const res = await request.get<TrialQuotaDto>(`${API_PREFIX}/trial-quota`);
  return res as unknown as TrialQuotaDto;
}

export async function fetchCreditsBalance(): Promise<CreditsBalanceDto> {
  const res = await request.get<CreditsBalanceDto>(
    `${API_PREFIX}/credits/balance`,
  );
  return res as unknown as CreditsBalanceDto;
}

export async function fetchCreditsLog(
  params: CreditsLogQuery = {},
): Promise<PageDataCreditsLog> {
  const res = await request.get<PageDataCreditsLog>(
    `${API_PREFIX}/credits/log`,
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        ...(params.type ? { type: params.type } : {}),
        ...(params.startTime ? { startTime: params.startTime } : {}),
        ...(params.endTime ? { endTime: params.endTime } : {}),
      },
    },
  );
  return res as unknown as PageDataCreditsLog;
}

export async function submitVideoGenerationTask(
  body: SubmitVideoGenerationRequest,
): Promise<VideoGenerationTaskDto> {
  const res = await request.post<VideoGenerationTaskDto>(
    `${API_PREFIX}/videos/tasks`,
    body,
  );
  return res as unknown as VideoGenerationTaskDto;
}

export async function fetchVideoTaskStatus(
  taskId: string,
): Promise<VideoTaskStatusDto> {
  const res = await request.get<VideoTaskStatusDto>(
    `${API_PREFIX}/videos/tasks/${taskId}`,
  );
  return res as unknown as VideoTaskStatusDto;
}

export async function refineVideoPrompt(
  body: PromptRefineRequest,
): Promise<PromptRefineResult> {
  const res = await request.post<PromptRefineResult>(
    `${API_PREFIX}/prompts/refine`,
    body,
  );
  return res as unknown as PromptRefineResult;
}

/**
 * 视频排队状态。canCreate=false 时「生成视频」按钮置灰。
 * 代理外部 GET /api/user/coze/workflow/queue-count。
 */
export async function fetchVideoQueueCount(): Promise<QueueCountDto> {
  const res = await request.get<QueueCountDto>(
    `${API_PREFIX}/videos/queue-count`,
  );
  return res as unknown as QueueCountDto;
}

/**
 * 文案排队状态。canCreate=false 时「生成文案」按钮置灰。
 * 代理外部 GET /api/user/copywriting/queue-count。
 */
export async function fetchCopywritingQueueCount(): Promise<QueueCountDto> {
  const res = await request.get<QueueCountDto>(
    `${API_PREFIX}/copywritings/queue-count`,
  );
  return res as unknown as QueueCountDto;
}

export async function fetchAvatarAssets(): Promise<AvatarAssetDto[]> {
  const res = await request.get<AvatarAssetDto[]>(`${API_PREFIX}/avatars`);
  return (res as unknown as AvatarAssetDto[]) ?? [];
}

export async function submitImageGenerationTask(
  body: SubmitImageGenerationRequest,
): Promise<ImageGenerationTaskDto> {
  const res = await request.post<ImageGenerationTaskDto>(
    `${API_PREFIX}/images/tasks`,
    body,
  );
  return res as unknown as ImageGenerationTaskDto;
}

export async function fetchImageGenerationTaskStatus(
  taskId: string,
): Promise<ImageGenerationTaskStatusDto> {
  const res = await request.get<ImageGenerationTaskStatusDto>(
    `${API_PREFIX}/images/tasks/${taskId}`,
  );
  return res as unknown as ImageGenerationTaskStatusDto;
}

export async function fetchWorkDetail(workId: string): Promise<WorkDetailDto> {
  const res = await request.get<WorkDetailDto>(`${API_PREFIX}/works/${workId}`);
  return res as unknown as WorkDetailDto;
}
