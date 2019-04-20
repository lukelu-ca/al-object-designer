using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Resources;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace ALCodeAnalysisBridge
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 2)
            {
                Console.WriteLine($"Invalid number of arguments: {args.Length}.");
                return;
            }

            var path = args[0];
            var dll = Assembly.LoadFile(path);
            var res = dll.GetManifestResourceNames();

            var result = ProcessResource(dll, "Microsoft.Dynamics.Nav.CodeAnalysis.PropertyDocumentationResources.resources");

            var outPath = args[1];

            File.WriteAllText(outPath, JsonConvert.SerializeObject(result, Formatting.Indented));

            Console.WriteLine($"Dictionary saved to {outPath}");
        }

        public static Dictionary<string, string> ProcessResource(Assembly dll, string resourceName)
        {
            Dictionary<string, string> result = new Dictionary<string, string>();

            using (var resource = dll.GetManifestResourceStream(resourceName))
            {
                using (ResourceReader reader = new ResourceReader(resource))
                {
                    foreach (DictionaryEntry entry in reader)
                    {
                        result.Add((string)entry.Key, (string)entry.Value);
                    }
                }
            }

            return result;
        }
    }
}
