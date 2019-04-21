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
            var outPath = args[1];

            var dll = Assembly.LoadFile(path);
            var res = dll.GetManifestResourceNames();
            var propInfo = dll.GetType("Microsoft.Dynamics.Nav.CodeAnalysis.PropertyKind");

            var view = new PropertyData();
            
            view.Properties = propInfo.GetEnumNames().ToList();
            view.PropertyDescription = ProcessResource(dll, "Microsoft.Dynamics.Nav.CodeAnalysis.PropertyDocumentationResources.resources");

            var props = new List<ALPropertyInfo>();
            foreach(var p in view.Properties)
            {
                var findings = view.PropertyDescription
                    .Where(w => w.Key.Contains(p))
                    .ToList();

                var places = findings.SelectMany(s => {
                    var parts = s.Key.Split(new Char[] { '_' }).ToList();
                    parts = parts.Take(parts.Count - 1).ToList();
                    return parts.Select(xs => new ALPropertyInfo { Name = xs, Description = s.Value }).ToList();
                })
                .ToList();

                var info = new ALPropertyInfo()
                {
                    Name = p,
                    RelatedTypes = places
                };

                props.Add(info);
            }

            var relatedTypes = props
                .SelectMany(s => s.RelatedTypes)
                .Select(s => s.Name)
                .Distinct()
                .ToList();

            var objectProps = relatedTypes
                .Select(s => {
                    var parts = new ALObjectPart();
                    parts.Name = s;
                    parts.Properties = props
                        .Where(w => w.RelatedTypes.Where(xw => xw.Name == s).Any())
                        .Select(xs => {
                            var result = new ALObjectPartProperty();
                            result.Name = xs.Name;
                            result.Description = xs.RelatedTypes
                                                .Where(w => w.Name == s)
                                                .FirstOrDefault()?
                                                .Description;
                            return result;
                        })
                        .OrderBy(o => o.Name)
                        .ToList();

                return parts;
            })
            .ToList();

            File.WriteAllText(outPath, JsonConvert.SerializeObject(objectProps, Formatting.Indented));
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

        public class PropertyData
        {
            public List<string> Properties;

            public Dictionary<string, string> PropertyDescription;
        }

        public class ALPropertyInfo
        {
            public ALPropertyInfo()
            {
                RelatedTypes = new List<ALPropertyInfo>();
            }

            public string Name { get; set; }
            public string Description { get; set; }
            public List<ALPropertyInfo> RelatedTypes { get; set; }
        }
        
        public class ALObjectPart
        {
            public string Name { get; set; }
            public List<ALObjectPartProperty> Properties { get; set; }
        }

        public class ALObjectPartProperty
        {
            public string Name { get; set; }
            public string Description { get; set; }
        }
    }
}
