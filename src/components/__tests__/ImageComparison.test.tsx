import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ImageComparison } from '../ImageComparison';

// Mock requestAnimationFrame for testing
const mockRequestAnimationFrame = vi.fn();
global.requestAnimationFrame = mockRequestAnimationFrame;

describe('ImageComparison Auto-Reveal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock requestAnimationFrame to execute immediately
    mockRequestAnimationFrame.mockImplementation((callback) => {
      setTimeout(callback, 0);
      return 1;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start slider at 0% (original image)', () => {
    render(
      <ImageComparison
        originalImage="data:image/png;base64,original"
        enhancedImage="data:image/png;base64,enhanced"
        autoReveal={false}
      />
    );

    // Check that slider starts at 0%
    const sliderText = screen.getByText(/0% enhanced visible/);
    expect(sliderText).toBeInTheDocument();
  });

  it('should auto-animate slider from 0% to 100% when autoReveal is true', async () => {
    render(
      <ImageComparison
        originalImage="data:image/png;base64,original"
        enhancedImage="data:image/png;base64,enhanced"
        autoReveal={true}
      />
    );

    // Initially should show animation message
    expect(screen.getByText(/Watch the AI restoration reveal automatically/)).toBeInTheDocument();

    // Wait for animation to complete
    await waitFor(
      () => {
        const sliderText = screen.queryByText(/100% enhanced visible/);
        return expect(sliderText).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should show enhancement badges when enhancements are provided', () => {
    const enhancements = [
      'Skew corrected (2.3° via Hough)',
      'Shadows removed (CLAHE)',
      'Yellowing corrected (LAB color balance)',
      'Faded text restored (CLAHE)',
      'Sharpness enhanced (moderate unsharp mask)'
    ];

    render(
      <ImageComparison
        originalImage="data:image/png;base64,original"
        enhancedImage="data:image/png;base64,enhanced"
        enhancements={enhancements}
      />
    );

    // Should show first 4 enhancements
    expect(screen.getByText(/✓ Skew corrected/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Shadows removed/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Yellowing corrected/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Faded text restored/)).toBeInTheDocument();

    // Should show "+1 more" for the 5th enhancement
    expect(screen.getByText(/\+1 more/)).toBeInTheDocument();
  });

  it('should switch between slider and side-by-side views', async () => {
    render(
      <ImageComparison
        originalImage="data:image/png;base64,original"
        enhancedImage="data:image/png;base64,enhanced"
      />
    );

    // Initially in slider mode
    expect(screen.getByText('Side by Side')).toBeInTheDocument();

    // Click to switch to side-by-side
    const toggleButton = screen.getByText('Side by Side');
    toggleButton.click();

    // Should now show "Slider" button and side-by-side layout
    await waitFor(() => {
      expect(screen.getByText('Slider')).toBeInTheDocument();
      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText('Enhanced')).toBeInTheDocument();
    });
  });

  it('should stop auto-reveal when user manually adjusts slider', async () => {
    const { container } = render(
      <ImageComparison
        originalImage="data:image/png;base64,original"
        enhancedImage="data:image/png;base64,enhanced"
        autoReveal={true}
      />
    );

    // Find the slider input
    const slider = container.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();

    // Simulate user interaction
    if (slider) {
      // Change slider value manually
      slider.setAttribute('value', '25');
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Should stop showing auto-reveal message
    await waitFor(() => {
      expect(screen.queryByText(/Watch the AI restoration reveal automatically/)).not.toBeInTheDocument();
    });
  });

  it('should show correct enhancement statistics', () => {
    const enhancements = [
      'Skew corrected',
      'Shadows removed',
      'Yellowing corrected'
    ];

    render(
      <ImageComparison
        originalImage="data:image/png;base64,original"
        enhancedImage="data:image/png;base64,enhanced"
        enhancements={enhancements}
      />
    );

    // Should show enhancement count
    expect(screen.getByText(/🎨 3 enhancements applied/)).toBeInTheDocument();
    expect(screen.getByText(/✨ AI-powered restoration/)).toBeInTheDocument();
  });

  it('should handle empty enhancements array gracefully', () => {
    render(
      <ImageComparison
        originalImage="data:image/png;base64,original"
        enhancedImage="data:image/png;base64,enhanced"
        enhancements={[]}
      />
    );

    // Should show 0 enhancements
    expect(screen.getByText(/🎨 0 enhancements applied/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <ImageComparison
        originalImage="data:image/png;base64,original"
        enhancedImage="data:image/png;base64,enhanced"
      />
    );

    // Check for alt text on images
    expect(screen.getByAltText('Original document')).toBeInTheDocument();
    expect(screen.getByAltText('Enhanced document')).toBeInTheDocument();

    // Check for slider accessibility
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
  });
});

describe('ImageComparison Integration with ProcessingSection', () => {
  it('should receive correct props from ProcessingSection when processing completes', () => {
    // This test verifies the integration point where ProcessingSection
    // passes the enhanced image and restoration summary to ImageComparison
    
    const mockRestorationSummary = {
      document_type: 'scan',
      detected_issues: ['Skew detected', 'Yellowing present'],
      enhancements_applied: [
        'Skew corrected (2.3° via Hough)',
        'Yellowing corrected (LAB color balance)'
      ],
      layout_info: {},
      quality_score: 85.5,
      skew_corrected: true,
      shadows_removed: false,
      yellowing_fixed: true
    };

    render(
      <ImageComparison
        originalImage="data:image/png;base64,original"
        enhancedImage="data:image/png;base64,enhanced"
        enhancements={mockRestorationSummary.enhancements_applied}
        autoReveal={true}
      />
    );

    // Verify enhancements are displayed
    expect(screen.getByText(/✓ Skew corrected/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Yellowing corrected/)).toBeInTheDocument();

    // Verify auto-reveal is active
    expect(screen.getByText(/Watch the AI restoration reveal automatically/)).toBeInTheDocument();
  });
});