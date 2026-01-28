import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DocumentParser, type ParsedDocument } from '@/lib/document-parser';
import { aiDocumentProcessor, type GeneratedFlashcard } from '@/lib/ai-document-processor';
import { DefaultButton } from '../form-elements/button';
import { Input } from '../form-elements/input';
import { Question } from '@/types/generic';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

interface ImportState {
  step: 'upload' | 'analyzing' | 'configuring' | 'generating' | 'review' | 'saving';
  document?: ParsedDocument;
  analysis?: {
    topics: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    suggestedCardCount: number;
    keyConcepts: string[];
  };
  generatedFlashcards: GeneratedFlashcard[];
  editedFlashcards: Question[];
  cardCount: number;
  selectedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  selectedTopics: string[];
  deckTitle: string;
  deckPassMark: number;
  isGenerating: boolean;
  isSaving: boolean;
  error?: string;
}

export const ImportFromDocScreen = () => {
  const router = useRouter();
  const [state, setState] = useState<ImportState>({
    step: 'upload',
    generatedFlashcards: [],
    editedFlashcards: [],
    cardCount: 10,
    selectedDifficulty: 'intermediate',
    selectedTopics: [],
    deckTitle: '',
    deckPassMark: 70,
    isGenerating: false,
    isSaving: false,
  });

  const handleDocumentPick = async () => {
    try {
      setState(prev => ({ ...prev, error: undefined }));
      
      const result = await DocumentParser.pickDocument();
      
      if (!result.success || !result.document) {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to pick document' 
        }));
        return;
      }

      // Validate document content
      const validation = DocumentParser.validateDocumentContent(result.document);
      if (!validation.isValid) {
        Alert.alert(
          'Document Validation Failed',
          validation.reason,
          [{ text: 'OK' }]
        );
        return;
      }

      setState(prev => ({
        ...prev,
        step: 'analyzing',
        document: result.document,
        deckTitle: result.document.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      }));

      // Analyze the document
      await analyzeDocument(result.document);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to process document',
        step: 'upload',
      }));
    }
  };

  const analyzeDocument = async (document: ParsedDocument) => {
    try {
      const analysis = await aiDocumentProcessor.analyzeDocument(document.text);
      
      setState(prev => ({
        ...prev,
        step: 'configuring',
        analysis,
        cardCount: analysis.suggestedCardCount,
        selectedDifficulty: analysis.difficulty,
        selectedTopics: analysis.topics.slice(0, 3), // Limit to top 3 topics
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze document',
        step: 'upload',
      }));
    }
  };

  const generateFlashcards = async () => {
    if (!state.document) return;

    try {
      setState(prev => ({ ...prev, step: 'generating', isGenerating: true, error: undefined }));

      const flashcards = await aiDocumentProcessor.generateFlashcards(
        state.document.text,
        state.cardCount,
        state.selectedDifficulty,
        state.selectedTopics
      );

      // Convert to Question format for editing
      const editedFlashcards: Question[] = flashcards.map((fc, index) => ({
        id: `generated-${index}`,
        question: fc.question,
        answer: fc.answer,
        hint: fc.hint,
      }));

      setState(prev => ({
        ...prev,
        step: 'review',
        generatedFlashcards: flashcards,
        editedFlashcards,
        isGenerating: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate flashcards',
        step: 'configuring',
        isGenerating: false,
      }));
    }
  };

  const improveFlashcards = async () => {
    try {
      setState(prev => ({ ...prev, isGenerating: true, error: undefined }));

      const improvedFlashcards = await aiDocumentProcessor.improveFlashcards(state.editedFlashcards);

      setState(prev => ({
        ...prev,
        editedFlashcards: improvedFlashcards,
        isGenerating: false,
      }));

      Alert.alert('Flashcards Improved', 'The AI has improved your flashcards for better learning.');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to improve flashcards',
        isGenerating: false,
      }));
    }
  };

  const updateFlashcard = (id: string, field: 'question' | 'answer' | 'hint', value: string) => {
    setState(prev => ({
      ...prev,
      editedFlashcards: prev.editedFlashcards.map(fc =>
        fc.id === id ? { ...fc, [field]: value } : fc
      ),
    }));
  };

  const saveFlashcards = async () => {
    try {
      setState(prev => ({ ...prev, step: 'saving', isSaving: true, error: undefined }));

      // TODO: Implement actual database save logic
      // This would integrate with your existing flashcard storage system
      
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success!',
        `Successfully saved ${state.editedFlashcards.length} flashcards to "${state.deckTitle}"`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save flashcards',
        step: 'review',
        isSaving: false,
      }));
    }
  };

  const renderUploadStep = () => (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Import Flashcards from Document</ThemedText>
      <ThemedText style={styles.subtitle}>
        Upload a PDF, DOCX, or TXT file to generate flashcards automatically using AI
      </ThemedText>

      <View style={styles.uploadArea}>
        <DefaultButton
          title="Choose Document"
          onPress={handleDocumentPick}
          btnVariant="PRIMARY"
        />
      </View>

      {state.error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{state.error}</ThemedText>
        </View>
      )}

      <View style={styles.supportedFormats}>
        <ThemedText style={styles.formatsTitle}>Supported formats:</ThemedText>
        <ThemedText style={styles.formatsList}>• PDF files</ThemedText>
        <ThemedText style={styles.formatsList}>• Microsoft Word documents (.docx)</ThemedText>
        <ThemedText style={styles.formatsList}>• Plain text files (.txt)</ThemedText>
      </View>
    </ThemedView>
  );

  const renderAnalyzingStep = () => (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Analyzing Document</ThemedText>
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      <ThemedText style={styles.subtitle}>
        AI is analyzing your document to identify key topics and suggest optimal flashcard settings...
      </ThemedText>
    </ThemedView>
  );

  const renderConfiguringStep = () => {
    if (!state.analysis || !state.document) return null;

    const stats = DocumentParser.getDocumentStats(state.document);
    const preview = DocumentParser.generateDocumentPreview(state.document);

    return (
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText style={styles.title}>Configure Flashcard Generation</ThemedText>
          
          {/* Document Preview */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Document Preview</ThemedText>
            <ThemedText style={styles.documentName}>{state.document.name}</ThemedText>
            <ThemedText style={styles.documentStats}>
              {stats.wordCount} words • {stats.estimatedReadingTime} min read
            </ThemedText>
            <View style={styles.previewBox}>
              <ThemedText style={styles.previewText}>{preview}</ThemedText>
            </View>
          </View>

          {/* AI Analysis Results */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>AI Analysis</ThemedText>
            <ThemedText style={styles.analysisText}>
              <ThemedText style={styles.label}>Topics:</ThemedText> {state.analysis.topics.join(', ')}
            </ThemedText>
            <ThemedText style={styles.analysisText}>
              <ThemedText style={styles.label}>Difficulty:</ThemedText> {state.analysis.difficulty}
            </ThemedText>
            <ThemedText style={styles.analysisText}>
              <ThemedText style={styles.label}>Suggested cards:</ThemedText> {state.analysis.suggestedCardCount}
            </ThemedText>
          </View>

          {/* Configuration Options */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Flashcard Settings</ThemedText>
            
            <Input
              label="Deck Title"
              value={state.deckTitle}
              onChangeText={(text) => setState(prev => ({ ...prev, deckTitle: text }))}
              placeholder="Enter deck title"
            />

            <Input
              label="Number of Flashcards"
              value={state.cardCount.toString()}
              onChangeText={(text) => {
                const count = parseInt(text) || 1;
                setState(prev => ({ ...prev, cardCount: Math.min(Math.max(count, 1), 50) }));
              }}
              placeholder="Number of flashcards"
              keyboardType="numeric"
            />

            <Input
              label="Pass Mark (%)"
              value={state.deckPassMark.toString()}
              onChangeText={(text) => {
                const passMark = parseInt(text) || 70;
                setState(prev => ({ ...prev, deckPassMark: Math.min(Math.max(passMark, 1), 100) }));
              }}
              placeholder="Pass mark percentage"
              keyboardType="numeric"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <DefaultButton
              title="Back"
              onPress={() => setState(prev => ({ ...prev, step: 'upload' }))}
              btnVariant="CANCEL"
            />
            <DefaultButton
              title="Generate Flashcards"
              onPress={generateFlashcards}
              btnVariant="PRIMARY"
            />
          </View>
        </ScrollView>
      </ThemedView>
    );
  };

  const renderGeneratingStep = () => (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Generating Flashcards</ThemedText>
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      <ThemedText style={styles.subtitle}>
        AI is creating {state.cardCount} flashcards from your document...
      </ThemedText>
    </ThemedView>
  );

  const renderReviewStep = () => (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>Review Generated Flashcards</ThemedText>
        
        <View style={styles.actionButtons}>
          <DefaultButton
            title="Improve with AI"
            onPress={improveFlashcards}
            isLoading={state.isGenerating}
            btnVariant="SECONDARY"
          />
        </View>

        {state.editedFlashcards.map((flashcard, index) => (
          <View key={flashcard.id} style={styles.flashcardContainer}>
            <ThemedText style={styles.flashcardNumber}>Card {index + 1}</ThemedText>
            
            <Input
              label="Question"
              value={flashcard.question}
              onChangeText={(text) => updateFlashcard(flashcard.id, 'question', text)}
              multiline
              style={styles.flashcardInput}
            />
            
            <Input
              label="Answer"
              value={flashcard.answer}
              onChangeText={(text) => updateFlashcard(flashcard.id, 'answer', text)}
              multiline
              style={styles.flashcardInput}
            />
            
            <Input
              label="Hint (optional)"
              value={flashcard.hint || ''}
              onChangeText={(text) => updateFlashcard(flashcard.id, 'hint', text)}
              placeholder="Add a hint for this card"
              style={styles.flashcardInput}
            />
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <DefaultButton
            title="Back"
            onPress={() => setState(prev => ({ ...prev, step: 'configuring' }))}
            btnVariant="CANCEL"
          />
          <DefaultButton
            title="Save Flashcards"
            onPress={saveFlashcards}
            isLoading={state.isSaving}
            btnVariant="SUCCESS"
          />
        </View>
      </ScrollView>
    </ThemedView>
  );

  const renderSavingStep = () => (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Saving Flashcards</ThemedText>
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      <ThemedText style={styles.subtitle}>
        Saving {state.editedFlashcards.length} flashcards to your collection...
      </ThemedText>
    </ThemedView>
  );

  const renderError = () => (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Error</ThemedText>
      <ThemedText style={styles.errorText}>{state.error}</ThemedText>
      <DefaultButton
        title="Try Again"
        onPress={() => setState(prev => ({ ...prev, step: 'upload', error: undefined }))}
        btnVariant="PRIMARY"
      />
    </ThemedView>
  );

  // Main render logic
  if (state.error && state.step !== 'upload' && state.step !== 'configuring' && state.step !== 'review') {
    return renderError();
  }

  switch (state.step) {
    case 'upload':
      return renderUploadStep();
    case 'analyzing':
      return renderAnalyzingStep();
    case 'configuring':
      return renderConfiguringStep();
    case 'generating':
      return renderGeneratingStep();
    case 'review':
      return renderReviewStep();
    case 'saving':
      return renderSavingStep();
    default:
      return renderUploadStep();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  uploadArea: {
    marginVertical: 30,
  },
  supportedFormats: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  formatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  formatsList: {
    fontSize: 14,
    marginBottom: 5,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 30,
  },
  section: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  documentStats: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 10,
  },
  previewBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  analysisText: {
    fontSize: 14,
    marginBottom: 5,
  },
  label: {
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 30,
    marginBottom: 20,
  },
  actionButtons: {
    marginBottom: 20,
  },
  flashcardContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  flashcardNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  flashcardInput: {
    marginBottom: 10,
  },
});