import Footer from '../../components/Footer'

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {/* Header Section */}
              <div className="sm:flex sm:items-center sm:justify-between">
                <div className="sm:flex sm:space-x-5">
                  <div className="flex-shrink-0">
                    <div className="mx-auto h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                    <p className="text-sm font-medium text-gray-600">Hello, I am</p>
                    <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                      Chuangji Li (李创基)
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      Carnegie Mellon University | AI/ML/Software Developer
                    </p>
                  </div>
                </div>
              </div>
              
              {/* About Me Section */}
              <div className="mt-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  About Me
                </h3>
                <div className="prose max-w-none text-gray-600 space-y-4">
                  <p>
                    I graduated from <strong>Carnegie Mellon University</strong> with a B.S. in <strong>Statistics and Machine Learning</strong>, 
                    where I developed a strong interest in AI/ML/NLP/GEN AI, and Software Development.
                  </p>
                  <p>
                    My research experience has focused on technologies and developer tools powered by large language models. 
                    I have built a graphRAG based math-question answer tool that gives textbook reference, as well as a 
                    retrieval-augmented code generation tool for smart contracts that combines CoT, RAG, and compiler auto-correction. 
                    My most recent internship focuses on developing a personalized pronunciation assessment system using 
                    Bayesian Knowledge Tracing Models, in combination with Automatic Speech Recognition.
                  </p>
                  <p>
                    I also enjoy systems and infrastructure work. I have built cloud-native platforms, distributed storage engines, 
                    and microservice-based web crawlers using tools like Go, Node.js, Kubernetes, Redis, and Elasticsearch.
                  </p>
                  <p>
                    <strong>My goal is to design AI tools that help people learn, create, and grow.</strong>
                  </p>
                </div>
              </div>
              
              {/* Courses Section */}
              <div className="mt-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Relevant Coursework
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    '17-214 Principles of Software System Construction',
                    '15-351 Algorithm Design & Analysis',
                    '10-315 Introduction to Machine Learning (SCS Major)',
                    '10-701 Introduction to Machine Learning (Ph.D.)',
                    '11-485 Introduction to Deep Learning',
                    '16-385 Computer Vision',
                    '10-623 Generative AI',
                    '11-711 Advanced Natural Language Processing',
                    '10-708 Probabilistic Graphical Models',
                    '10-714 Deep Learning System',
                    '36-700 Probability and Mathematical Statistics'
                  ].map((course) => (
                    <div
                      key={course}
                      className="text-sm text-gray-600 py-1"
                    >
                      • {course}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Skills Section */}
              <div className="mt-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Technical Skills
                </h3>
                
                {/* Programming Languages */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Programming Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {['C/C++', 'Python', 'Java', 'Go', 'R', 'JavaScript/TypeScript', 'HTML/CSS'].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Databases */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Databases</h4>
                  <div className="flex flex-wrap gap-2">
                    {['SQL', 'MySQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch', 'FAISS'].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Frameworks & Libraries */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Frameworks & Libraries</h4>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Django', 'Next.js', 'FastAPI', 'JUnit', 'Jest', 'Kafka', 'Grafana', 'Prometheus'].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Machine Learning */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Machine Learning</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Pandas', 'NumPy', 'PyTorch', 'Scikit-learn', 'HuggingFace', 'TensorFlow'].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cloud & DevOps */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Cloud & DevOps</h4>
                  <div className="flex flex-wrap gap-2">
                    {['AWS (EC2, S3)', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'PM2', 'GitHub Actions'].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
