'use client';
import FlashNav from '../../../components/FlashNav';
import { Calendar, User, Clock, Share2, Bookmark } from 'lucide-react';

export default function OpenShiftAIArticle() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-hc-bright-gold z-[60] w-full origin-left animate-[grow_1s_ease-out]"></div>

      <FlashNav activePage="blog" />

      <div className="pt-32 max-w-4xl mx-auto px-4 pb-24 relative z-10">
        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hc-purple/10 border border-hc-purple/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-hc-purple animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-hc-light-purple">
              Technical Guide
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">
            Red Hat OpenShift AI
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-hc-bright-gold to-white">
              Installation and Setup
            </span>
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hc-purple to-hc-gold p-[1px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-black text-[10px] text-white">
                  DA
                </div>
              </div>
              <span className="font-bold text-white">Diego Alvarez Ponce</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hc-purple to-hc-gold p-[1px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-black text-[10px] text-white">
                  KA
                </div>
              </div>
              <span className="font-bold text-white">Kaitlyn Abdo</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-600"></div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <Calendar size={14} />
              <span>May 1, 2024</span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flash-card !p-8 md:!p-12 border-white/5 bg-black/40 backdrop-blur-md relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-hc-purple/10 blur-[80px] pointer-events-none"></div>

          <article className="prose prose-invert prose-lg max-w-none">
            {/* Table of Contents */}
            <div className="bg-white/5 rounded-2xl p-6 mb-12 border border-white/5 not-prose">
              <h3 className="text-xs font-black uppercase tracking-widest text-hc-bright-gold mb-4">
                Table of Contents
              </h3>
              <ul className="space-y-2 text-sm font-medium text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">
                  • Introduction
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">
                  • LVM storage installation
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">
                  • Node Feature Discovery installation
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">
                  • NVIDIA GPU Operator Installation
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">
                  • Verification
                </li>
              </ul>
            </div>

            <p className="lead text-xl text-gray-300 font-medium">
              Welcome to the third article in this series, which covers the process to prepare and
              run computer vision models at the edge.
            </p>

            <h2 className="text-3xl font-black tracking-tight mt-12 mb-6 flex items-center gap-3">
              <span className="text-hc-purple">#</span> Introduction
            </h2>

            <p>
              Red Hat OpenShift AI is a comprehensive platform designed to streamline the
              development, deployment, and management of data science and machine learning
              applications in hybrid and multi-cloud environments. Leveraging the Red Hat OpenShift
              app dev platform, OpenShift AI empowers data science teams to exploit container
              orchestration capabilities for scalable and efficient deployment.
            </p>

            <p>
              In this tutorial, we will prepare and install the Red Hat OpenShift AI operator and
              its components. This includes enabling the use of GPU and the storage configuration.
              The next article in this series will cover how to use the operator for AI model
              training.
            </p>

            <h2 className="text-3xl font-black tracking-tight mt-12 mb-6 flex items-center gap-3">
              <span className="text-hc-purple">#</span> LVM Storage Installation
            </h2>

            <p>
              OpenShift AI will require some storage when creating workbenches and deploying
              notebooks. Therefore, one of the prerequisites will be to install the{' '}
              <strong>Logical Volume Manager Storage (LVMS)</strong> operator on our single node
              OpenShift (SNO). LVMS uses Linux Logical Volume Manager (LVM) as a back end to provide
              the necessary storage space for OpenShift AI in our SNO.
            </p>

            <div className="my-8 p-6 bg-hc-bright-gold/5 border-l-4 border-hc-bright-gold rounded-r-xl">
              <h4 className="text-hc-bright-gold font-black uppercase tracking-widest text-xs mb-2">
                Important Note
              </h4>
              <p className="text-sm text-gray-300 m-0">
                LVMS requires an empty dedicated disk to provision storage. To ensure that the
                operator can be installed and used, make sure you already have an empty disk
                available.
              </p>
            </div>

            <p>
              The easiest and most convenient way to install the operator is via the OpenShift web
              console:
            </p>

            <ol className="space-y-4 text-gray-300 marker:text-hc-bright-gold marker:font-bold">
              <li>
                In your SNO web console, navigate to the <strong>Operators</strong> section on the
                left-hand menu.
              </li>
              <li>
                Select <strong>OperatorHub</strong>. This will show the marketplace catalog
                integrated in Red Hat OpenShift Container Platform (OCP) with the different
                operators available.
              </li>
              <li>
                In the search field, type <strong>LVMS</strong>.
              </li>
              <li>
                Select the <strong>LVM Storage operator</strong> and click Install on the right side
                of the screen.
              </li>
            </ol>

            <p className="mt-6">
              Once in the configuration page, we can keep the default values. Press Install again.
              Wait a little while the installation finishes. Then, press the{' '}
              <strong>Create LVMCluster</strong> button that just appeared.
            </p>

            <p>
              In the configuration form you can change some of the parameters, like the instance
              name, device class, etc. Check the default box under{' '}
              <code>storage {'>'} deviceClasses</code> to use <code>lvms-vg1</code> as the default
              storage class.
            </p>

            <p>
              Press the Create button to start the custom resource creation. You can wait for the
              Status to become Ready, or check the deployment process from the command line. In the
              Terminal connected to your SNO, run the following command:
            </p>

            <div className="bg-black/50 rounded-xl border border-white/10 p-4 font-mono text-sm overflow-x-auto">
              <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                <span className="text-xs text-gray-500 uppercase tracking-widest">Terminal</span>
                <button className="text-[10px] text-hc-purple hover:text-white transition-colors">
                  COPY
                </button>
              </div>
              <code className="text-green-400">watch oc get pods -n openshift-storage</code>
            </div>

            <p>Wait until you see all pods running:</p>

            <div className="bg-black/50 rounded-xl border border-white/10 p-4 font-mono text-xs overflow-x-auto text-gray-400">
              <div className="grid grid-cols-5 gap-4 mb-2 font-bold text-gray-500 border-b border-white/5 pb-2">
                <div className="col-span-2">NAME</div>
                <div>READY</div>
                <div>STATUS</div>
                <div>AGE</div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2">lvms-operator-5656d84f77-ntlzm</div>
                <div>1/1</div>
                <div className="text-green-400">Running</div>
                <div>2m45s</div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2">topolvm-controller-7dd48b6556-dg222</div>
                <div>5/5</div>
                <div className="text-green-400">Running</div>
                <div>109s</div>
              </div>
              {/* ... more rows ... */}
            </div>

            <h2 className="text-3xl font-black tracking-tight mt-12 mb-6 flex items-center gap-3">
              <span className="text-hc-purple">#</span> Node Feature Discovery Installation
            </h2>

            <p>
              Now, let's focus on configuring our node so the GPU can be detected. Red Hat’s
              supported approach is using the <strong>NVIDIA GPU Operator</strong>. Before
              installing it, there are a couple of prerequisites we need to meet.
            </p>

            <p>
              The first one is installing the <strong>Node Feature Discovery Operator (NFD)</strong>
              . This operator will manage the detection and configuration of hardware features in
              our SNO. The process will be quite similar to the one we just followed.
            </p>

            <ol className="space-y-4 text-gray-300 marker:text-hc-purple marker:font-bold">
              <li>
                In the web console, locate the <strong>Operators</strong> section on the left menu
                again.
              </li>
              <li>
                Click <strong>OperatorHub</strong> to access the catalog.
              </li>
              <li>
                Once there, type <strong>NFD</strong> in the text box. We will get two results.
              </li>
              <li>
                In this case, I will install the operator that is supported by Red Hat. Click
                Install.
              </li>
            </ol>

            <p>
              This will prompt us to a second page with different configurable parameters. Let’s
              keep the default values and press the Install button. This will trigger the operator
              installation. Once finished, press <strong>View Operator</strong>.
            </p>

            <p>
              Under the NodeFeatureDiscovery component, click <strong>Create instance</strong>. As
              we did before, keep the default values and click Create. This instance proceeds to
              label the GPU node.
            </p>

            <p>Verify the installation by running the following command in your terminal:</p>

            <div className="bg-black/50 rounded-xl border border-white/10 p-4 font-mono text-sm overflow-x-auto mb-6">
              <code className="text-green-400">watch oc get pods -n openshift-nfd</code>
            </div>

            <p>
              The Node Feature Discovery Operator uses vendor PCI IDs to identify hardware in our
              node. <code>0x10de</code> is the PCI vendor ID that is assigned to NVIDIA, so we can
              verify if that label is present in our node by running:
            </p>

            <div className="bg-black/50 rounded-xl border border-white/10 p-4 font-mono text-sm overflow-x-auto">
              <code className="text-green-400">oc describe node | grep 0x10de</code>
            </div>

            <h2 className="text-3xl font-black tracking-tight mt-12 mb-6 flex items-center gap-3">
              <span className="text-hc-purple">#</span> NVIDIA GPU Operator Installation
            </h2>

            <p>Once we have the node labeled, we can proceed with the GPU operator installation.</p>

            <ol className="space-y-4 text-gray-300 marker:text-hc-bright-gold marker:font-bold">
              <li>
                Go back to <strong>OperatorHub</strong> and search for{' '}
                <strong>NVIDIA GPU Operator</strong>.
              </li>
              <li>Select the one provided by NVIDIA and click Install.</li>
              <li>Keep the default values and click Install.</li>
              <li>
                Once the operator is installed, click <strong>View Operator</strong>.
              </li>
              <li>
                Click <strong>Create ClusterPolicy</strong>.
              </li>
              <li>
                The form will show different configuration options. For our SNO, we need to enable
                the sandbox workloads.
              </li>
              <li>Click Create.</li>
            </ol>

            <p className="mt-6">
              This will trigger the deployment of the driver and the toolkit. This process can take
              a few minutes.
            </p>

            <h2 className="text-3xl font-black tracking-tight mt-12 mb-6 flex items-center gap-3">
              <span className="text-hc-purple">#</span> Verification
            </h2>

            <p>
              To verify that everything is working as expected, we can run a pod that requests a GPU
              resource. Create a file named <code>gpu-pod.yaml</code> with the following content:
            </p>

            <div className="bg-black/50 rounded-xl border border-white/10 p-4 font-mono text-sm overflow-x-auto my-6 relative group">
              <div className="absolute top-2 right-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                YAML
              </div>
              <pre className="text-gray-300">
                {`apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  containers:
    - name: gpu-container
      image: nvcr.io/nvidia/cuda:11.0.3-base-ubi8
      command: ["/bin/sh"]
      args: ["-c", "while true; do echo hello; sleep 10;done"]
      resources:
        limits:
          nvidia.com/gpu: 1`}
              </pre>
            </div>

            <p>Apply the file:</p>

            <div className="bg-black/50 rounded-xl border border-white/10 p-4 font-mono text-sm overflow-x-auto mb-6">
              <code className="text-green-400">oc apply -f gpu-pod.yaml</code>
            </div>

            <p>Check the logs:</p>

            <div className="bg-black/50 rounded-xl border border-white/10 p-4 font-mono text-sm overflow-x-auto mb-6">
              <code className="text-green-400">oc logs gpu-pod</code>
            </div>

            <div className="my-8 p-6 bg-green-500/5 border-l-4 border-green-500 rounded-r-xl">
              <h4 className="text-green-500 font-black uppercase tracking-widest text-xs mb-2">
                Success
              </h4>
              <p className="text-sm text-gray-300 m-0">
                If you see "hello" printed every 10 seconds, congratulations! You have successfully
                configured your OpenShift AI environment.
              </p>
            </div>

            <h2 className="text-3xl font-black tracking-tight mt-12 mb-6 flex items-center gap-3">
              <span className="text-hc-purple">#</span> Summary
            </h2>

            <p>
              In this article, we have covered the installation of the LVM Storage and the NVIDIA
              GPU operators. These are key components to run AI workloads at the edge.
            </p>
            <p>In the next article, we will see how to use these resources to train a model.</p>
          </article>

          {/* Article Footer */}
          <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                <Share2 size={16} /> Share
              </button>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-hc-bright-gold transition-colors">
                <Bookmark size={16} /> Save
              </button>
            </div>
            <p className="text-[10px] text-gray-600 font-mono">ID: 8492-OPENSHIFT-AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
