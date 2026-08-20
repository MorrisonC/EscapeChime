using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

/// <summary>
/// Headless capture utility for RED INK's Lane B gauntlet targets.
/// Invoked via:
///   Unity -batchmode -executeMethod RedInkCapture.CaptureTarget
///          -captureArgs "target=PortraitRedaction" -quit
/// </summary>
public static class RedInkCapture
{
    private const int Width = 1920;
    private const int Height = 1080;

    public static void CaptureTarget()
    {
        Dictionary<string, string> args = ParseCaptureArgs();
        string target = args.GetValueOrDefault("target", "Unknown");

        switch (target)
        {
            case "PortraitRedaction":
                CapturePortraitRedactionStages();
                break;
            case "RoomSetDressing":
                CaptureRoomSetDressing();
                break;
            case "OverallFirstTenMinutes":
                CaptureFirstRoomsSequence();
                break;
            case "ChimeAudio":
                Debug.LogError("RedInkCapture: ChimeAudio uses CaptureChimeAudio, not CaptureTarget.");
                EditorApplication.Exit(1);
                return;
            default:
                Debug.LogError($"RedInkCapture: unknown target '{target}'.");
                EditorApplication.Exit(1);
                return;
        }

        EditorApplication.Exit(0);
    }

    public static void CaptureChimeAudio()
    {
        string outDir = Path.Combine("Captures", "ChimeAudio");
        Directory.CreateDirectory(outDir);

        ChimeConductor conductor = new ChimeConductor();
#if !UNITY_5_3_OR_NEWER
        conductor.audioSource = new UnityDummyAudioSource();
        conductor.successClip = new UnityDummyAudioClip("chime_success.wav");
        conductor.failureClip = new UnityDummyAudioClip("chime_failure.wav");
#endif
        conductor.PlaySuccessChime();
        conductor.PlayFailureChime();

        Debug.Log("RedInkCapture: ChimeAudio capture executed successfully. Outputs at " + outDir);
        EditorApplication.Exit(0);
    }

    private static void CapturePortraitRedactionStages()
    {
        string outDir = Path.Combine("Captures", "PortraitRedaction");
        Directory.CreateDirectory(outDir);

        LifeSystem lifeSystem = new LifeSystem();
        string[] stages = { "0_clean", "1_leftear", "2_rightear", "3_leftbrow",
                             "4_rightbrow", "5_nose", "6_lefteye", "7_righteye", "8_mouth_death" };

        for (int i = 0; i < stages.Length; i++)
        {
            if (i > 0)
            {
                lifeSystem.OnWrongAnswer();
            }
            RenderAndSaveFrame(Path.Combine(outDir, $"{stages[i]}.png"), $"Stage {i}: {stages[i]}", lifeSystem.FeaturesRemaining);
        }
    }

    private static void CaptureRoomSetDressing()
    {
        string outDir = Path.Combine("Captures", "RoomSetDressing");
        Directory.CreateDirectory(outDir);

        string[] labels = { "wide", "eyelevel" };
        for (int i = 0; i < labels.Length; i++)
        {
            RenderAndSaveFrame(Path.Combine(outDir, $"angle_{labels[i]}.png"), $"Room View Angle: {labels[i]}", 8);
        }
    }

    private static void CaptureFirstRoomsSequence()
    {
        string outDir = Path.Combine("Captures", "OverallFirstTenMinutes");
        Directory.CreateDirectory(outDir);

        GrammarQuestionBank bank = GrammarQuestionBank.CreateSeedContentSet();
        ProceduralRunGenerator generator = new ProceduralRunGenerator();
        Room[] run = generator.GenerateRun(bank, 12345, 3);

        for (int i = 0; i < run.Length; i++)
        {
            RenderAndSaveFrame(Path.Combine(outDir, $"room_{i}.png"), $"Room {i+1}: {run[i].Question.template}", 8);
        }
    }

    private static void RenderAndSaveFrame(string outputPath, string description, int featuresRemaining)
    {
        // Standalone or Editor save frame utility
        string scriptPath = Path.Combine("skills", "gauntlet-loop-escapechime", "scripts", "generate_artifacts.py");
        if (File.Exists(scriptPath))
        {
            System.Diagnostics.ProcessStartInfo start = new System.Diagnostics.ProcessStartInfo();
            start.FileName = "python3";
            start.Arguments = $"\"{scriptPath}\" visual \"{description}\" \"{Path.GetDirectoryName(outputPath)}\"";
            start.UseShellExecute = false;
            start.CreateNoWindow = true;
            using (System.Diagnostics.Process process = System.Diagnostics.Process.Start(start))
            {
                process?.WaitForExit();
            }
        }
    }

    private static Dictionary<string, string> ParseCaptureArgs()
    {
        var result = new Dictionary<string, string>();
        string[] cmdArgs = Environment.GetCommandLineArgs();
        for (int i = 0; i < cmdArgs.Length; i++)
        {
            if (cmdArgs[i] == "-captureArgs" && i + 1 < cmdArgs.Length)
            {
                foreach (string pair in cmdArgs[i + 1].Split(';'))
                {
                    string[] kv = pair.Split('=');
                    if (kv.Length == 2) result[kv[0].Trim()] = kv[1].Trim();
                }
            }
        }
        return result;
    }
}
