import React, { useEffect, useState } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  Inject,
  Toolbar,
  ExcelExport,
  Filter,
} from "@syncfusion/ej2-react-grids";
import { useLocation, useNavigate } from "react-router-dom";
const Result = () => {
  const location = useLocation();
  const [foundData, setFoundData] = useState([
    { "Serial No": "1", Found: "lhk" },
    { "Serial No": "2", Found: "dfds" },
  ]);
  const [notFoundData, setNotFoundData] = useState([]);
  const state = location.state;
  const navigate = useNavigate();
  useEffect(() => {
    // Redirect to "/" if state is missing
    if (!state) {
      navigate("/", { replace: true });
      return;
    }
    const copiedImages = state.copiedImages;
    const transformedfoundDataData = copiedImages.map((image, index) => ({
      "Serial No": index + 1,
      Found: image,
    }));
    setFoundData(transformedfoundDataData);
  }, [state]);
  useEffect(() => {
    // Redirect to "/" if state is missing
    if (!state) {
      navigate("/", { replace: true });
      return;
    }
    const notCopiedImages = state.notFoundImages;
    console.log(notCopiedImages);
    const transformedNotfoundDataData = notCopiedImages.map((image, index) => ({
      "Serial No": index + 1,
      "Not Found": image,
    }));
    setNotFoundData(transformedNotfoundDataData);
  }, [state]);
  // If state is missing, the user will already be redirected
  if (!state) return null;
  return (
    <>
      <div style={{ display: "flex" }}>
        <div>
          <div>
            <h3>
              Found Count : <span>{state.copiedCount}</span>
            </h3>
          </div>
          <GridComponent
            dataSource={foundData}
            height={"650px"}
            allowSorting={false}
            allowFiltering={false}
            allowExcelExport={true}
            allowPdfExport={false}
            allowEditing={false}
          >
            <ColumnsDirective>
              <ColumnDirective
                field={"Serial No"}
                headerText={"Serial No"}
                width="50"
                textAlign="Center"
              ></ColumnDirective>
              <ColumnDirective
                field={"Found"}
                headerText={"Found Images"}
                width="120"
                textAlign="Center"
              ></ColumnDirective>
            </ColumnsDirective>
          </GridComponent>
        </div>
        <div>
          <div>
            <h3>
              Not Found Count : <span>{state.notFoundCount}</span>
            </h3>
          </div>
          <GridComponent
            dataSource={notFoundData}
            height={"650px"}
            allowSorting={false}
            allowFiltering={false}
            allowExcelExport={true}
            allowPdfExport={false}
            allowEditing={false}
          >
            <ColumnsDirective>
              <ColumnDirective
                field={"Serial No"}
                headerText={"Serial No"}
                width="50"
                textAlign="Center"
              ></ColumnDirective>
              <ColumnDirective
                field={"Not Found"}
                headerText={"Not Found"}
                width="120"
                textAlign="Center"
              ></ColumnDirective>
            </ColumnsDirective>
          </GridComponent>
        </div>
      </div>
    </>
  );
};

export default Result;
