"""
Test fixtures for Nhaka 2.0 Archive Resurrection system.
Provides reusable test data for agents, contexts, and results.

Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
"""
from datetime import datetime
from typing import Dict, List, Optional
import pytest

# Import models from main.py
import sys
sys.path.insert(0, '.')
from main import (
    AgentType, ConfidenceLevel, AgentMessage, TextSegment,
    RepairRecommendation, DamageHotspot, ResurrectionResult
)


# =============================================================================
# SAMPLE TEXT DATA
# =============================================================================

SAMPLE_DOKE_TEXT = """Kuna VaRungu vekuBritain,
Ini Loɓengula, Mamɓo weMataɓele, ndinonyora tsamba iyi 
nezuva re30 Gumiguru 1888. Ndakasaina chibvumirano 
naCharles Rudd pamusoro pekuchera matomɓo.

Zvakasainwa pamɓeri pezvapupu: Jameson, Colquhoun.

[Chikamu chakaparara - ink degradation]

Ndatenda,
Loɓengula"""

SAMPLE_MODERN_TEXT = """Kuna VaRungu vekuBritain,
Ini Lobengula, Mambo weMatabele, ndinonyora tsamba iyi 
nezuva re30 Gumiguru 1888. Ndakasaina chibvumirano 
naCharles Rudd pamusoro pekuchera matombo.

Zvakasainwa pamberi pezvapupu: Jameson, Colquhoun.

[Chikamu chakaparara - ink degradation]

Ndatenda,
Lobengula"""

SAMPLE_RUDD_CONCESSION_TEXT = """To all whom it may concern,

Know ye that whereas Charles Dunell Rudd, of Kimberley; 
Rochfort Maguire, of London; and Francis Robert Thompson, 
of Kimberley, have covenanted and agreed with me, Lobengula, 
King of Matabeleland, Mashonaland, and other adjoining territories.

Dated this 30th day of October, 1888, at my Royal Kraal.

Signed: Lobengula (his mark)
Witnesses: J.S. Moffat, C.D. Helm"""

SAMPLE_DAMAGED_TEXT = """[illegible] VaRungu [damaged]
Ini Lobengula, [faded text] weMatabele
[water damage - 3 lines missing]
Zvakasainwa [torn section]
Ndatenda,
[signature illegible]"""


# =============================================================================
# AGENT MESSAGE FIXTURES
# =============================================================================

@pytest.fixture
def sample_scanner_message() -> AgentMessage:
    """Sample message from Scanner agent."""
    return AgentMessage(
        agent=AgentType.SCANNER,
        message="📝 OCR extraction complete: 245 characters extracted.",
        confidence=82.5,
        document_section="Text Extraction",
        is_debate=False,
        timestamp=datetime(2024, 1, 15, 10, 30, 0),
        metadata={"characters_extracted": 245}
    )


@pytest.fixture
def sample_linguist_message() -> AgentMessage:
    """Sample message from Linguist agent."""
    return AgentMessage(
        agent=AgentType.LINGUIST,
        message="📝 TRANSLITERATION: 3 Doke→Modern conversions made.",
        confidence=85.0,
        document_section="Transliteration",
        is_debate=False,
        timestamp=datetime(2024, 1, 15, 10, 30, 5),
        metadata={"changes_count": 3}
    )


@pytest.fixture
def sample_historian_message() -> AgentMessage:
    """Sample message from Historian agent."""
    return AgentMessage(
        agent=AgentType.HISTORIAN,
        message="👤 KEY FIGURES: Lobengula, Rudd",
        confidence=88.0,
        document_section="Figure Detection",
        is_debate=False,
        timestamp=datetime(2024, 1, 15, 10, 30, 10),
        metadata={"figures": ["Lobengula", "Rudd"]}
    )


@pytest.fixture
def sample_validator_message() -> AgentMessage:
    """Sample message from Validator agent."""
    return AgentMessage(
        agent=AgentType.VALIDATOR,
        message="📈 FINAL CONFIDENCE SCORE: 78.5%",
        confidence=78.5,
        document_section="Final Score",
        is_debate=False,
        timestamp=datetime(2024, 1, 15, 10, 30, 15),
        metadata=None
    )


@pytest.fixture
def sample_repair_message() -> AgentMessage:
    """Sample message from Physical Repair Advisor agent."""
    return AgentMessage(
        agent=AgentType.REPAIR_ADVISOR,
        message="🔍 DAMAGE DETECTED: 2 conservation issues identified.",
        confidence=80.0,
        document_section="Damage Assessment",
        is_debate=False,
        timestamp=datetime(2024, 1, 15, 10, 30, 20),
        metadata={"damage_types": ["iron_gall_ink", "foxing"]}
    )


@pytest.fixture
def sample_agent_messages() -> List[AgentMessage]:
    """Complete list of sample agent messages from all agents."""
    return [
        AgentMessage(
            agent=AgentType.SCANNER,
            message="🔬 Initializing PaddleOCR-VL forensic scan...",
            confidence=None,
            timestamp=datetime(2024, 1, 15, 10, 30, 0)
        ),
        AgentMessage(
            agent=AgentType.SCANNER,
            message="📝 OCR extraction complete: 245 characters extracted.",
            confidence=82.5,
            document_section="Text Extraction",
            timestamp=datetime(2024, 1, 15, 10, 30, 2)
        ),
        AgentMessage(
            agent=AgentType.LINGUIST,
            message="📚 Initializing Doke Orthography analysis...",
            confidence=None,
            timestamp=datetime(2024, 1, 15, 10, 30, 5)
        ),
        AgentMessage(
            agent=AgentType.LINGUIST,
            message="📝 TRANSLITERATION: 3 Doke→Modern conversions made.",
            confidence=85.0,
            document_section="Transliteration",
            timestamp=datetime(2024, 1, 15, 10, 30, 7)
        ),
        AgentMessage(
            agent=AgentType.HISTORIAN,
            message="📜 Initializing historical analysis engine...",
            confidence=None,
            timestamp=datetime(2024, 1, 15, 10, 30, 10)
        ),
        AgentMessage(
            agent=AgentType.HISTORIAN,
            message="👤 KEY FIGURES: Lobengula, Rudd",
            confidence=88.0,
            document_section="Figure Detection",
            timestamp=datetime(2024, 1, 15, 10, 30, 12)
        ),
        AgentMessage(
            agent=AgentType.VALIDATOR,
            message="🔍 Initializing hallucination detection protocols...",
            confidence=None,
            timestamp=datetime(2024, 1, 15, 10, 30, 15)
        ),
        AgentMessage(
            agent=AgentType.VALIDATOR,
            message="📈 FINAL CONFIDENCE SCORE: 78.5%",
            confidence=78.5,
            document_section="Final Score",
            timestamp=datetime(2024, 1, 15, 10, 30, 17)
        ),
        AgentMessage(
            agent=AgentType.REPAIR_ADVISOR,
            message="🔧 Initializing physical condition assessment...",
            confidence=None,
            timestamp=datetime(2024, 1, 15, 10, 30, 20)
        ),
        AgentMessage(
            agent=AgentType.REPAIR_ADVISOR,
            message="🔍 DAMAGE DETECTED: 2 conservation issues identified.",
            confidence=80.0,
            document_section="Damage Assessment",
            timestamp=datetime(2024, 1, 15, 10, 30, 22)
        ),
    ]


# =============================================================================
# TEXT SEGMENT FIXTURES
# =============================================================================

@pytest.fixture
def sample_text_segment_high() -> TextSegment:
    """Sample text segment with high confidence."""
    return TextSegment(
        text="Kuna VaRungu vekuBritain, Ini Lobengula, Mambo weMatabele",
        confidence=ConfidenceLevel.HIGH,
        original_text="Kuna VaRungu vekuBritain, Ini Loɓengula, Mamɓo weMataɓele",
        corrections=["ɓ→b transliteration applied"]
    )


@pytest.fixture
def sample_text_segment_medium() -> TextSegment:
    """Sample text segment with medium confidence."""
    return TextSegment(
        text="Ndakasaina chibvumirano naCharles Rudd",
        confidence=ConfidenceLevel.MEDIUM,
        original_text="Ndakasaina [unclear] naCharles Rudd",
        corrections=["Inferred 'chibvumirano' from context"]
    )


@pytest.fixture
def sample_text_segment_low() -> TextSegment:
    """Sample text segment with low confidence."""
    return TextSegment(
        text="[illegible section - approximately 2 lines]",
        confidence=ConfidenceLevel.LOW,
        original_text="[damaged]",
        corrections=None
    )


# =============================================================================
# REPAIR RECOMMENDATION FIXTURES
# =============================================================================

@pytest.fixture
def sample_repair_recommendation_critical() -> RepairRecommendation:
    """Sample critical repair recommendation."""
    return RepairRecommendation(
        issue="Iron-gall ink corrosion",
        severity="critical",
        recommendation="Calcium phytate treatment to neutralize acid",
        estimated_cost="$200-500 per document"
    )


@pytest.fixture
def sample_repair_recommendation_moderate() -> RepairRecommendation:
    """Sample moderate repair recommendation."""
    return RepairRecommendation(
        issue="Brown spots from fungal/oxidation damage",
        severity="moderate",
        recommendation="Aqueous deacidification and bleaching",
        estimated_cost="$100-300 per document"
    )


@pytest.fixture
def sample_repair_recommendations() -> List[RepairRecommendation]:
    """List of sample repair recommendations."""
    return [
        RepairRecommendation(
            issue="Iron-gall ink corrosion",
            severity="critical",
            recommendation="Calcium phytate treatment to neutralize acid",
            estimated_cost="$200-500 per document"
        ),
        RepairRecommendation(
            issue="Brown spots from fungal/oxidation damage",
            severity="moderate",
            recommendation="Aqueous deacidification and bleaching",
            estimated_cost="$100-300 per document"
        ),
        RepairRecommendation(
            issue="Paper brittleness from acid degradation",
            severity="critical",
            recommendation="Mass deacidification (Bookkeeper process)",
            estimated_cost="$75-150 per document"
        ),
    ]


# =============================================================================
# DAMAGE HOTSPOT FIXTURES
# =============================================================================

@pytest.fixture
def sample_damage_hotspot() -> DamageHotspot:
    """Sample damage hotspot for AR visualization."""
    return DamageHotspot(
        id=1,
        x=25.5,
        y=35.0,
        damage_type="iron_gall_ink",
        severity="critical",
        label="Iron-gall ink corrosion",
        treatment="Calcium phytate treatment to neutralize acid",
        icon="🔍"
    )


@pytest.fixture
def sample_damage_hotspots() -> List[DamageHotspot]:
    """List of sample damage hotspots."""
    return [
        DamageHotspot(
            id=1,
            x=25.5,
            y=35.0,
            damage_type="iron_gall_ink",
            severity="critical",
            label="Iron-gall ink corrosion",
            treatment="Calcium phytate treatment",
            icon="🔍"
        ),
        DamageHotspot(
            id=2,
            x=70.0,
            y=25.0,
            damage_type="foxing",
            severity="moderate",
            label="Fungal damage spots",
            treatment="Aqueous deacidification",
            icon="🟤"
        ),
        DamageHotspot(
            id=3,
            x=50.0,
            y=60.0,
            damage_type="fading",
            severity="minor",
            label="Ink fading from light",
            treatment="Multispectral imaging",
            icon="☀️"
        ),
    ]


# =============================================================================
# CONTEXT FIXTURES
# =============================================================================

@pytest.fixture
def sample_context_empty() -> Dict:
    """Empty context at start of processing."""
    return {
        "image_data": b"fake_image_data",
        "start_time": datetime(2024, 1, 15, 10, 30, 0)
    }


@pytest.fixture
def sample_context_after_scanner() -> Dict:
    """Context after Scanner agent processing."""
    return {
        "image_data": b"fake_image_data",
        "start_time": datetime(2024, 1, 15, 10, 30, 0),
        "raw_text": SAMPLE_DOKE_TEXT,
        "ocr_confidence": 82.5
    }


@pytest.fixture
def sample_context_after_linguist() -> Dict:
    """Context after Linguist agent processing."""
    return {
        "image_data": b"fake_image_data",
        "start_time": datetime(2024, 1, 15, 10, 30, 0),
        "raw_text": SAMPLE_DOKE_TEXT,
        "ocr_confidence": 82.5,
        "transliterated_text": SAMPLE_MODERN_TEXT,
        "linguistic_changes": [
            ("ɓ", "b", "Implosive bilabial → standard 'b' (1955 reform)"),
        ],
        "historical_terms": [
            ("Matabele", ("AmaNdebele", "Colonial term for Ndebele people")),
        ]
    }


@pytest.fixture
def sample_context_after_historian() -> Dict:
    """Context after Historian agent processing."""
    return {
        "image_data": b"fake_image_data",
        "start_time": datetime(2024, 1, 15, 10, 30, 0),
        "raw_text": SAMPLE_DOKE_TEXT,
        "ocr_confidence": 82.5,
        "transliterated_text": SAMPLE_MODERN_TEXT,
        "linguistic_changes": [
            ("ɓ", "b", "Implosive bilabial → standard 'b' (1955 reform)"),
        ],
        "historical_terms": [
            ("Matabele", ("AmaNdebele", "Colonial term for Ndebele people")),
        ],
        "historian_findings": [],
        "verified_facts": [
            "Rudd-Lobengula treaty context",
            "Date '1888' consistent with Rudd Concession period"
        ],
        "historical_anomalies": []
    }


@pytest.fixture
def sample_context_complete() -> Dict:
    """Complete context after all agents."""
    return {
        "image_data": b"fake_image_data",
        "start_time": datetime(2024, 1, 15, 10, 30, 0),
        "raw_text": SAMPLE_DOKE_TEXT,
        "ocr_confidence": 82.5,
        "transliterated_text": SAMPLE_MODERN_TEXT,
        "linguistic_changes": [
            ("ɓ", "b", "Implosive bilabial → standard 'b' (1955 reform)"),
        ],
        "historical_terms": [
            ("Matabele", ("AmaNdebele", "Colonial term for Ndebele people")),
        ],
        "historian_findings": [],
        "verified_facts": [
            "Rudd-Lobengula treaty context",
            "Date '1888' consistent with Rudd Concession period"
        ],
        "historical_anomalies": [],
        "final_confidence": 78.5,
        "validator_warnings": [],
        "validator_corrections": [],
        "repair_recommendations": [
            RepairRecommendation(
                issue="Iron-gall ink corrosion",
                severity="critical",
                recommendation="Calcium phytate treatment",
                estimated_cost="$200-500"
            )
        ],
        "damage_hotspots": [
            DamageHotspot(
                id=1,
                x=25.5,
                y=35.0,
                damage_type="iron_gall_ink",
                severity="critical",
                label="Iron-gall ink corrosion",
                treatment="Calcium phytate treatment",
                icon="🔍"
            )
        ],
        "digitization_priority": 75
    }


# =============================================================================
# RESURRECTION RESULT FIXTURES
# =============================================================================

@pytest.fixture
def sample_resurrection_result() -> ResurrectionResult:
    """Complete sample resurrection result."""
    return ResurrectionResult(
        segments=[
            TextSegment(
                text=SAMPLE_MODERN_TEXT,
                confidence=ConfidenceLevel.HIGH,
                original_text=SAMPLE_DOKE_TEXT,
                corrections=["ɓ→b transliteration applied"]
            )
        ],
        overall_confidence=78.5,
        agent_messages=[
            AgentMessage(
                agent=AgentType.SCANNER,
                message="📝 OCR extraction complete",
                confidence=82.5,
                timestamp=datetime(2024, 1, 15, 10, 30, 0)
            ),
            AgentMessage(
                agent=AgentType.LINGUIST,
                message="📝 TRANSLITERATION complete",
                confidence=85.0,
                timestamp=datetime(2024, 1, 15, 10, 30, 5)
            ),
        ],
        processing_time_ms=5000,
        raw_ocr_text=SAMPLE_DOKE_TEXT,
        transliterated_text=SAMPLE_MODERN_TEXT,
        historian_analysis="['Rudd-Lobengula treaty context']",
        validator_corrections=[],
        repair_recommendations=[
            RepairRecommendation(
                issue="Iron-gall ink corrosion",
                severity="critical",
                recommendation="Calcium phytate treatment",
                estimated_cost="$200-500"
            )
        ],
        damage_hotspots=[
            DamageHotspot(
                id=1,
                x=25.5,
                y=35.0,
                damage_type="iron_gall_ink",
                severity="critical",
                label="Iron-gall ink corrosion",
                treatment="Calcium phytate treatment",
                icon="🔍"
            )
        ],
        archive_id="test-archive-123"
    )


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def create_agent_message(
    agent: AgentType,
    message: str,
    confidence: Optional[float] = None,
    section: Optional[str] = None,
    is_debate: bool = False,
    metadata: Optional[Dict] = None
) -> AgentMessage:
    """Helper to create custom agent messages."""
    return AgentMessage(
        agent=agent,
        message=message,
        confidence=confidence,
        document_section=section,
        is_debate=is_debate,
        timestamp=datetime.utcnow(),
        metadata=metadata
    )


def create_text_segment(
    text: str,
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM,
    original: Optional[str] = None,
    corrections: Optional[List[str]] = None
) -> TextSegment:
    """Helper to create custom text segments."""
    return TextSegment(
        text=text,
        confidence=confidence,
        original_text=original,
        corrections=corrections
    )


def create_damage_hotspot(
    id: int,
    x: float,
    y: float,
    damage_type: str = "yellowing",
    severity: str = "moderate"
) -> DamageHotspot:
    """Helper to create custom damage hotspots."""
    return DamageHotspot(
        id=id,
        x=x,
        y=y,
        damage_type=damage_type,
        severity=severity,
        label=f"{damage_type} damage",
        treatment=f"Treatment for {damage_type}",
        icon="⚠️"
    )
