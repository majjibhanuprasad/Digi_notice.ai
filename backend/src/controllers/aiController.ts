import { Request, Response } from 'express';
import { 
  generateNotice, 
  recommendTarget, 
  checkContent, 
  generateSummary, 
  translateNotice, 
  askNoticeAI 
} from '../services/aiService';
import { Notice } from '../models/Schemas';

export const handleGenerateNotice = async (req: Request, res: Response) => {
  try {
    const result = generateNotice(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: 'AI generation error', error: err.message });
  }
};

export const handleRecommendTarget = async (req: Request, res: Response) => {
  const { content, title } = req.body;
  try {
    const recommendations = recommendTarget(content || '', title || '');
    return res.json(recommendations);
  } catch (err: any) {
    return res.status(500).json({ message: 'AI targeting recommendations error', error: err.message });
  }
};

export const handleContentCheck = async (req: Request, res: Response) => {
  const { content, title, metadata } = req.body;
  try {
    const checkResult = checkContent(content || '', title || '', metadata || {});
    return res.json(checkResult);
  } catch (err: any) {
    return res.status(500).json({ message: 'AI safety content validation error', error: err.message });
  }
};

export const handleGenerateSummary = async (req: Request, res: Response) => {
  const { content } = req.body;
  try {
    const summary = generateSummary(content || '');
    return res.json({ summary });
  } catch (err: any) {
    return res.status(500).json({ message: 'AI summarization error', error: err.message });
  }
};

export const handleTranslateNotice = async (req: Request, res: Response) => {
  const { content, targetLanguage } = req.body;
  try {
    const translation = translateNotice(content || '', targetLanguage || 'English');
    return res.json({ translation });
  } catch (err: any) {
    return res.status(500).json({ message: 'AI translation error', error: err.message });
  }
};

export const handleAskNoticeAI = async (req: Request, res: Response) => {
  const { noticeId, question } = req.body;

  try {
    if (!noticeId || !question) {
      return res.status(400).json({ message: 'Notice ID and question are required' });
    }

    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    const answer = askNoticeAI(notice, question);
    return res.json({ answer });
  } catch (err: any) {
    console.error('Error in Notice Q&A:', err);
    return res.status(500).json({ message: 'AI Q&A panel error', error: err.message });
  }
};
