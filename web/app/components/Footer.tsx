import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2D2D35] bg-[#0B0B0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Kura</h3>
            <p className="text-sm text-gray-400">
              One app to manage all your financial assets from tradfi to crypto.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-7.029 3.746 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.6915026,1.64600329 C15.4744286,0.904915502 14.1301111,0.471788035 12.6978022,0.33985814 C12.5242095,0.32109657 12.3539952,0.420028893 12.3004289,0.589328347 C12.1215048,1.13187195 11.9240457,1.64788484 11.7439908,2.13525491 C10.0151126,1.84886969 8.29057387,1.84886969 6.56267024,2.13525491 C6.41795581,1.68619119 6.2557867,1.13187195 6.07639046,0.589328347 C6.02286247,0.420914357 5.85265036,0.320915147 5.67906087,0.33985814 C4.24674306,0.471512141 2.90242755,0.904360248 1.68534747,1.64600329 C1.52786766,1.74231657 1.41773121,1.9131987 1.44569245,2.08714608 C2.08233361,5.94758024 3.35542856,9.58360286 5.22125427,12.7868175 C5.33141072,12.9573083 5.50162282,13.0546587 5.67523232,13.0546587 C6.52736331,13.0546587 7.4472501,12.8899899 8.40189308,12.5844649 C8.54661751,12.5360839 8.66451621,12.4326905 8.72805396,12.2987049 C8.88553378,11.9374365 9.02765142,11.5658079 9.1525088,11.1941794 C9.20404024,11.0232886 9.10113067,10.8524428 8.92941863,10.8349435 C7.04898234,10.6687121 5.27906151,10.1938649 3.68645337,9.42750551 C3.51823953,9.3337052 3.41528095,9.15396852 3.41528095,8.9577797 L3.41528095,8.9577797 C3.41528095,8.71989651 3.56346766,8.51329285 3.76696846,8.44447563 C5.29976504,7.83352854 6.68849057,7.41013794 7.90531975,7.18455374 C8.08703703,7.14977845 8.2222017,7.01000298 8.22593539,6.82665245 C8.19797415,5.41050403 8.7490803,4.12656667 9.74253683,3.27619087 C9.88726126,3.16123485 9.94440728,2.95768249 9.86979559,2.78831879 C9.84183436,2.72612042 9.81034067,2.66452899 9.77497444,2.60414872 C8.83095265,1.10343182 8.3670818,0.0884653683 8.37081549,0.0854251056 C8.37081549,0.0854251056 8.11813048,0.32109657 8.26290905,-0.0487912033 C8.35649854,-0.289032062 8.52844582,-0.425597031 8.73169601,-0.425597031 C8.73169601,-0.425597031 9.16263398,0.117869207 11.005384,1.85327107 C11.7451978,1.78031968 12.4971449,1.74231657 13.2548743,1.74231657 C14.0244647,1.74231657 14.7791156,1.78031968 15.5157273,1.85327107 C17.3579227,0.129376651 17.7888607,-0.425597031 17.7888607,-0.425597031 C17.9920509,-0.425597031 18.1640082,-0.289032062 18.2575976,0.0487912033 C18.4023721,0.317484886 18.1496871,-0.0487912033 18.1496871,-0.0487912033 C18.1534208,-0.0884653683 17.6894835,1.11270481 16.7286008,2.61649889 C16.6968722,2.66904273 16.6653436,2.72612042 16.6374623,2.78831879 C16.5628506,2.95768249 16.6199966,3.16123485 16.7646711,3.27619087 C17.7581276,4.12656667 18.3093837,5.41050403 18.2814024,6.82665245 C18.2851361,7.00810125 18.4203008,7.14977845 18.602018,7.18455374 C19.8188472,7.40763389 21.2055585,7.83352854 22.7383951,8.44447563 C22.9418959,8.51409785 23.089082,8.72069216 23.089082,8.9577797 C23.089082,8.9577797 23.089082,9.13748934 22.95,9.42750551 C21.3502844,10.1938649 19.5824636,10.6687121 17.7021572,10.8349435 C17.5304451,10.8525828 17.4275356,11.0233285 17.4790671,11.1941794 C17.6050217,11.5658079 17.7440935,11.9374365 17.902572,12.2987049 C17.9663098,12.4326905 18.0842085,12.5360839 18.2289829,12.5844649 C19.1835928,12.8899899 20.1035796,13.0546587 20.9557106,13.0546587 C21.1293033,13.0546587 21.2995177,12.9573083 21.4096741,12.7868175 C23.2755099,9.58360286 24.548605,5.94758024 25.1852462,2.08714608 C25.2132274,1.9131987 25.103091,1.74231657 24.9456112,1.64600329" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.557.636-1.914-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817a9.586 9.586 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.195 20 14.44 20 10.017 20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#2D2D35] pt-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Kura. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-4 md:mt-0">
            Built with care for the crypto and traditional finance community.
          </p>
        </div>
      </div>
    </footer>
  );
}
