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
///
/// Does NOT use -nographics for visual captures -- same reasoning as
/// the unity-cli-bridge skill's RoomCapture.cs: screenshot rendering
/// needs the GPU path. -batchmode alone (no window, GPU active) is
/// correct.
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

    /// <summary>
    /// Separate entry point for audio bounce, since it doesn't share the
    /// screenshot pipeline. Invoked via -executeMethod
    /// RedInkCapture.CaptureChimeAudio (no -captureArgs needed --
    /// always captures both success and failure variants).
    /// </summary>
    public static void CaptureChimeAudio()
    {
        string scenePath = "Assets/Scenes/CaptureStage.unity";
        if (!File.Exists(scenePath))
        {
            Debug.LogError($"RedInkCapture: capture stage scene missing at {scenePath}");
            EditorApplication.Exit(1);
            return;
        }
        EditorSceneManager.OpenScene(scenePath, OpenSceneMode.Single);

        GameObject conductorObj = GameObject.Find("ChimeConductor");
        if (conductorObj == null)
        {
            Debug.LogError("RedInkCapture: no ChimeConductor found in capture stage scene.");
            EditorApplication.Exit(1);
            return;
        }

        string outDir = Path.Combine("Captures", "ChimeAudio");
        Directory.CreateDirectory(outDir);

        // NOTE: bouncing an AudioClip to WAV outside of play mode requires
        // either a play-mode-driven recorder (e.g. AudioClip.GetData over
        // a captured play-mode session) or the Unity Recorder package's
        // audio track. This stub marks the two clips this method is
        // responsible for producing -- wire to your project's actual
        // ChimeConductor clip references before relying on this in CI.
        Debug.Log("RedInkCapture: TODO wire actual AudioClip -> WAV bounce for " +
                  "success/failure chime variants. Expected outputs: " +
                  Path.Combine(outDir, "success_chime.wav") + ", " +
                  Path.Combine(outDir, "failure_chime.wav"));

        EditorApplication.Exit(0);
    }

    private static void CapturePortraitRedactionStages()
    {
        string scenePath = "Assets/Scenes/CaptureStage.unity";
        EditorSceneManager.OpenScene(scenePath, OpenSceneMode.Single);

        GameObject portrait = GameObject.Find("PortraitBust");
        Camera cam = GameObject.Find("CaptureCamera")?.GetComponent<Camera>();
        if (portrait == null || cam == null)
        {
            Debug.LogError("RedInkCapture: PortraitBust or CaptureCamera missing from capture stage.");
            EditorApplication.Exit(1);
            return;
        }

        string outDir = Path.Combine("Captures", "PortraitRedaction");
        Directory.CreateDirectory(outDir);

        // 8 stages per GDD Section 4: left ear, right ear, left eyebrow,
        // right eyebrow, nose, left eye, right eye, mouth (death stage).
        string[] stages = { "0_clean", "1_leftear", "2_rightear", "3_leftbrow",
                             "4_rightbrow", "5_nose", "6_lefteye", "7_righteye", "8_mouth_death" };

        var lifeSystem = portrait.GetComponent("LifeSystem"); // reflection-friendly; replace with real type once available
        for (int i = 0; i < stages.Length; i++)
        {
            // TODO: call the project's actual LifeSystem method to set
            // feature-loss count to i (e.g. lifeSystem.SetFeaturesLost(i))
            // once that component exists. Left generic here since
            // Lane A tests (LifeSystemTests) are the source of truth for
            // its real API.
            RenderAndSave(cam, Path.Combine(outDir, $"{stages[i]}.png"));
        }
    }

    private static void CaptureRoomSetDressing()
    {
        string scenePath = "Assets/Scenes/CaptureStage.unity";
        EditorSceneManager.OpenScene(scenePath, OpenSceneMode.Single);

        Camera cam = GameObject.Find("CaptureCamera")?.GetComponent<Camera>();
        GameObject room = GameObject.Find("SampleRoom");
        if (cam == null || room == null)
        {
            Debug.LogError("RedInkCapture: CaptureCamera or SampleRoom missing.");
            EditorApplication.Exit(1);
            return;
        }

        string outDir = Path.Combine("Captures", "RoomSetDressing");
        Directory.CreateDirectory(outDir);

        Bounds b = room.GetComponent<Renderer>()?.bounds ?? new Bounds(room.transform.position, Vector3.one * 3);
        Vector3[] positions =
        {
            b.center + new Vector3(0, b.extents.y * 2.5f, -b.extents.z * 2.5f), // wide
            b.center + new Vector3(b.extents.x * 0.3f, 1.6f, -b.extents.z * 0.6f), // eye-level, player-ish height
        };
        string[] labels = { "wide", "eyelevel" };

        for (int i = 0; i < positions.Length; i++)
        {
            cam.transform.position = positions[i];
            cam.transform.LookAt(b.center);
            RenderAndSave(cam, Path.Combine(outDir, $"angle_{labels[i]}.png"));
        }
    }

    private static void CaptureFirstRoomsSequence()
    {
        // Composite target -- captures a short sequence across the first
        // few rooms of a deterministic seeded run, for a pacing/dread
        // judgment rather than a single-frame one.
        string scenePath = "Assets/Scenes/CaptureStage.unity";
        EditorSceneManager.OpenScene(scenePath, OpenSceneMode.Single);

        Camera cam = GameObject.Find("CaptureCamera")?.GetComponent<Camera>();
        if (cam == null)
        {
            Debug.LogError("RedInkCapture: CaptureCamera missing.");
            EditorApplication.Exit(1);
            return;
        }

        string outDir = Path.Combine("Captures", "OverallFirstTenMinutes");
        Directory.CreateDirectory(outDir);

        // TODO: drive ProceduralRunGenerator with a fixed seed (log the
        // seed in the output dir so the critic prompt can name it) and
        // capture one frame per of the first 3 rooms. Left as a stub
        // pending the actual generator API -- Lane A's
        // ProceduralRunGeneratorTests defines the real contract.
        for (int i = 0; i < 3; i++)
        {
            RenderAndSave(cam, Path.Combine(outDir, $"room_{i}.png"));
        }
    }

    private static void RenderAndSave(Camera cam, string outputPath)
    {
        RenderTexture rt = new RenderTexture(Width, Height, 24, RenderTextureFormat.ARGB32);
        cam.targetTexture = rt;
        Texture2D screenshot = new Texture2D(Width, Height, TextureFormat.RGB24, false);

        cam.Render();
        RenderTexture.active = rt;
        screenshot.ReadPixels(new Rect(0, 0, Width, Height), 0, 0);
        screenshot.Apply();

        File.WriteAllBytes(outputPath, screenshot.EncodeToPNG());

        cam.targetTexture = null;
        RenderTexture.active = null;
        UnityEngine.Object.DestroyImmediate(rt);
        UnityEngine.Object.DestroyImmediate(screenshot);
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
