import { UserButton } from "@/components/auth/user-button";


const DashboardPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-10 h-16 bg-white p-4">
        <UserButton />
        </div>
        <div className="mt-16">

          {/* <TemplatesGallery />
          <DocumentsTable
            documents={results}
            loadMore={loadMore}
            status={status}
          /> */}
        </div>
      </div>
    )
}
export default DashboardPage;