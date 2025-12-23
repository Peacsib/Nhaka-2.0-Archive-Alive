/**
 * Test utilities for React component testing.
 * Provides helpers for rendering, SSE mocking, and user interactions.
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { AgentType } from '@/components/AgentAvatar';

// =============================================================================
// RENDER UTILITIES
// =============================================================================

/**
 * Custom render function that wraps components with necessary providers.
 * Use this instead of @testing-library/react's render for all component tests.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TooltipProvider>
        {children}
      </TooltipProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };


// =============================================================================
// SSE MOCK UTILITIES
// =============================================================================

export interface MockAgentMessage {
  agent: AgentType;
  message: string;
  confidence?: number;
  document_section?: string;
  is_debate?: boolean;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface MockResurrectionResult {
  overall_confidence: number;
  processing_time_ms: number;
  raw_ocr_text?: string;
  transliterated_text?: string;
  archive_id?: string;
  repair_recommendations?: Array<{
    issue: string;
    severity: string;
    recommendation: string;
    estimated_cost?: string;
  }>;
  damage_hotspots?: Array<{
    id: number;
    x: number;
    y: number;
    damage_type: string;
    severity: string;
    label: string;
    treatment: string;
    icon: string;
  }>;
}

export interface MockCompleteEvent {
  type: 'complete';
  cached?: boolean;
  cache_hash?: string;
  result: MockResurrectionResult;
}

/**
 * Create a mock SSE stream for testing agent message streaming.
 * Returns a ReadableStream that can be used to mock fetch responses.
 */
export function createMockSSEStream(
  messages: MockAgentMessage[],
  completeData?: MockCompleteEvent,
  delayMs: number = 0
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let messageIndex = 0;

  return new ReadableStream({
    async start(controller) {
      // Send agent messages
      for (const message of messages) {
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        const sseData = `data: ${JSON.stringify(message)}\n\n`;
        controller.enqueue(encoder.encode(sseData));
        messageIndex++;
      }

      // Send complete event if provided
      if (completeData) {
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        const sseData = `data: ${JSON.stringify(completeData)}\n\n`;
        controller.enqueue(encoder.encode(sseData));
      }

      controller.close();
    },
  });
}

/**
 * Create a mock fetch response for SSE streaming endpoint.
 */
export function createMockSSEResponse(
  messages: MockAgentMessage[],
  completeData?: MockCompleteEvent,
  delayMs: number = 0
): Response {
  const stream = createMockSSEStream(messages, completeData, delayMs);
  
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Mock the global fetch function for SSE testing.
 * Returns a cleanup function to restore original fetch.
 */
export function mockFetchSSE(
  messages: MockAgentMessage[],
  completeData?: MockCompleteEvent,
  delayMs: number = 0
): () => void {
  const originalFetch = global.fetch;
  
  global.fetch = vi.fn().mockResolvedValue(
    createMockSSEResponse(messages, completeData, delayMs)
  );

  // Return cleanup function
  return () => {
    global.fetch = originalFetch;
  };
}


// =============================================================================
// SAMPLE DATA GENERATORS
// =============================================================================

/**
 * Generate sample agent messages for testing.
 */
export function generateSampleMessages(count: number = 5): MockAgentMessage[] {
  const agents: AgentType[] = ['scanner', 'linguist', 'historian', 'validator', 'repair_advisor'];
  const messages: MockAgentMessage[] = [];

  for (let i = 0; i < count; i++) {
    const agent = agents[i % agents.length];
    messages.push({
      agent,
      message: `Test message ${i + 1} from ${agent}`,
      confidence: 70 + Math.random() * 30,
      timestamp: new Date().toISOString(),
    });
  }

  return messages;
}

/**
 * Generate a complete resurrection result for testing.
 */
export function generateSampleResult(
  overallConfidence: number = 78.5
): MockResurrectionResult {
  return {
    overall_confidence: overallConfidence,
    processing_time_ms: 5000,
    raw_ocr_text: 'Sample raw OCR text',
    transliterated_text: 'Sample transliterated text',
    archive_id: 'test-archive-123',
    repair_recommendations: [
      {
        issue: 'Iron-gall ink corrosion',
        severity: 'critical',
        recommendation: 'Calcium phytate treatment',
        estimated_cost: '$200-500',
      },
    ],
    damage_hotspots: [
      {
        id: 1,
        x: 25.5,
        y: 35.0,
        damage_type: 'iron_gall_ink',
        severity: 'critical',
        label: 'Iron-gall ink corrosion',
        treatment: 'Calcium phytate treatment',
        icon: '🔍',
      },
    ],
  };
}

/**
 * Generate a complete SSE event for testing.
 */
export function generateCompleteEvent(
  cached: boolean = false
): MockCompleteEvent {
  return {
    type: 'complete',
    cached,
    cache_hash: cached ? 'abc123def456' : undefined,
    result: generateSampleResult(),
  };
}


// =============================================================================
// USER INTERACTION HELPERS
// =============================================================================

/**
 * Simulate file upload by creating a mock File object.
 */
export function createMockFile(
  name: string = 'test-document.jpg',
  type: string = 'image/jpeg',
  size: number = 1024
): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

/**
 * Simulate drag and drop file upload.
 */
export function createDragEvent(
  type: string,
  files: File[]
): DragEvent {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));

  const event = new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    dataTransfer,
  });

  return event;
}

/**
 * Wait for a specific number of milliseconds.
 * Useful for testing animations and delays.
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for an element to appear in the DOM.
 */
export async function waitForElement(
  callback: () => HTMLElement | null,
  timeout: number = 3000
): Promise<HTMLElement> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = callback();
    if (element) {
      return element;
    }
    await wait(50);
  }
  
  throw new Error('Element not found within timeout');
}


// =============================================================================
// ASSERTION HELPERS
// =============================================================================

/**
 * Check if a confidence score is displayed correctly as a percentage.
 */
export function expectConfidenceFormat(text: string, confidence: number): void {
  const expected = `${confidence.toFixed(1)}%`;
  expect(text).toContain(expected);
}

/**
 * Check if damage hotspot is positioned correctly.
 */
export function expectHotspotPosition(
  element: HTMLElement,
  x: number,
  y: number,
  tolerance: number = 1
): void {
  const style = element.style;
  const left = parseFloat(style.left);
  const top = parseFloat(style.top);
  
  expect(Math.abs(left - x)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(top - y)).toBeLessThanOrEqual(tolerance);
}

/**
 * Check if all agent types are present in messages.
 */
export function expectAllAgentsPresent(messages: MockAgentMessage[]): void {
  const agents = new Set(messages.map(m => m.agent));
  const expectedAgents: AgentType[] = [
    'scanner',
    'linguist',
    'historian',
    'validator',
    'repair_advisor',
  ];
  
  expectedAgents.forEach(agent => {
    expect(agents.has(agent)).toBe(true);
  });
}


// =============================================================================
// FAST-CHECK GENERATORS (for property-based testing)
// =============================================================================

import * as fc from 'fast-check';

/**
 * Generate arbitrary agent type.
 */
export const arbitraryAgentType = (): fc.Arbitrary<AgentType> => {
  return fc.constantFrom<AgentType>(
    'scanner',
    'linguist',
    'historian',
    'validator',
    'repair_advisor'
  );
};

/**
 * Generate arbitrary confidence score (0-100).
 */
export const arbitraryConfidence = (): fc.Arbitrary<number> => {
  return fc.float({ min: 0, max: 100, noNaN: true });
};

/**
 * Generate arbitrary coordinates (0-100 percentage).
 */
export const arbitraryCoordinates = (): fc.Arbitrary<{ x: number; y: number }> => {
  return fc.record({
    x: fc.float({ min: 0, max: 100, noNaN: true }),
    y: fc.float({ min: 0, max: 100, noNaN: true }),
  });
};

/**
 * Generate arbitrary agent message.
 */
export const arbitraryAgentMessage = (): fc.Arbitrary<MockAgentMessage> => {
  return fc.record({
    agent: arbitraryAgentType(),
    message: fc.string({ minLength: 10, maxLength: 200 }),
    confidence: fc.option(arbitraryConfidence(), { nil: undefined }),
    document_section: fc.option(
      fc.constantFrom(
        'Text Extraction',
        'Transliteration',
        'Figure Detection',
        'Date Verification',
        'Confidence Warning',
        'Damage Assessment'
      ),
      { nil: undefined }
    ),
    is_debate: fc.boolean(),
    timestamp: fc.date().map(d => d.toISOString()),
    metadata: fc.option(
      fc.dictionary(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.oneof(
          fc.integer(),
          fc.float({ noNaN: true }),
          fc.string({ maxLength: 50 }),
          fc.boolean()
        )
      ),
      { nil: undefined }
    ),
  });
};

/**
 * Generate arbitrary damage hotspot.
 */
export const arbitraryDamageHotspot = (): fc.Arbitrary<MockResurrectionResult['damage_hotspots'][0]> => {
  return fc.record({
    id: fc.integer({ min: 1, max: 100 }),
    x: fc.float({ min: 0, max: 100, noNaN: true }),
    y: fc.float({ min: 0, max: 100, noNaN: true }),
    damage_type: fc.constantFrom(
      'iron_gall_ink',
      'foxing',
      'tears',
      'fading',
      'water_damage',
      'brittleness',
      'yellowing'
    ),
    severity: fc.constantFrom('critical', 'moderate', 'minor'),
    label: fc.string({ minLength: 10, maxLength: 100 }),
    treatment: fc.string({ minLength: 20, maxLength: 200 }),
    icon: fc.constantFrom('🔍', '🟤', '📄', '☀️', '💧', '⚡', '⚠️'),
  });
};

/**
 * Generate arbitrary resurrection result.
 */
export const arbitraryResurrectionResult = (): fc.Arbitrary<MockResurrectionResult> => {
  return fc.record({
    overall_confidence: arbitraryConfidence(),
    processing_time_ms: fc.integer({ min: 100, max: 60000 }),
    raw_ocr_text: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
    transliterated_text: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
    archive_id: fc.option(fc.string({ minLength: 10, maxLength: 50 }), { nil: undefined }),
    repair_recommendations: fc.option(
      fc.array(
        fc.record({
          issue: fc.string({ minLength: 10, maxLength: 100 }),
          severity: fc.constantFrom('critical', 'moderate', 'minor'),
          recommendation: fc.string({ minLength: 20, maxLength: 200 }),
          estimated_cost: fc.option(fc.string({ minLength: 5, maxLength: 30 }), { nil: undefined }),
        }),
        { minLength: 1, maxLength: 5 }
      ),
      { nil: undefined }
    ),
    damage_hotspots: fc.option(
      fc.array(arbitraryDamageHotspot(), { minLength: 1, maxLength: 6 }),
      { nil: undefined }
    ),
  });
};


// =============================================================================
// COMPONENT-SPECIFIC HELPERS
// =============================================================================

/**
 * Helper to test AgentTheater component with messages.
 */
export function setupAgentTheaterTest(messageCount: number = 5) {
  const messages = generateSampleMessages(messageCount);
  const completeEvent = generateCompleteEvent();
  
  return {
    messages,
    completeEvent,
    mockFetch: () => mockFetchSSE(messages, completeEvent),
  };
}

/**
 * Helper to test ProcessingSection with file upload.
 */
export function setupProcessingSectionTest() {
  const file = createMockFile();
  const messages = generateSampleMessages(10);
  const completeEvent = generateCompleteEvent();
  
  return {
    file,
    messages,
    completeEvent,
    mockFetch: () => mockFetchSSE(messages, completeEvent),
  };
}

/**
 * Helper to test DocumentPreview with restored data.
 */
export function setupDocumentPreviewTest() {
  const file = createMockFile();
  const result = generateSampleResult();
  
  const restoredData = {
    segments: [
      { text: result.transliterated_text || 'Sample text', confidence: 'high' as const },
    ],
    overallConfidence: result.overall_confidence,
  };
  
  return {
    file,
    restoredData,
    result,
  };
}
