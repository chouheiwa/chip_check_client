import React from "react";

const labelConfig =  `<View>
      <RectangleLabels name="tag" toName="img">
        {{0}}
      </RectangleLabels>
      <Image name="img" value="$image" selectioncontrol="{{1}}"/>
      </View>
      `;

type LabelImageProps = {
  canLabel: boolean;
  imageUrl: string;
  configs: string[];
  annotations: any[];
};

const LabelImage: React.FC<LabelImageProps> = (props) => {
  // we need a reference to a DOM node here so LSF knows where to render
  const rootRef = React.useRef();
  // this reference will be populated when LSF initialized and can be used somewhere else
  const lsfRef = React.useRef();
  // we're running an effect on component mount and rendering LSF inside rootRef node
  React.useEffect(() => {
    if (rootRef.current) {
      // @ts-ignore
      lsfRef.current = new LabelStudio(rootRef.current, {
        /* all the options according to the docs */
        config: labelConfig.replace('{{1}}', `${props.canLabel}`).replace('{{0}}', props.configs.reduce((acc, cur) => acc + `<Label value="${cur}"></Label>`, '')),
        interfaces: ["panel", "update"],
        task: {
          annotations: [
            {result: props.annotations}
          ],
          predictions: [],
          id: 1,
          data: {
            image: props.imageUrl,
          }
        },
        // @ts-ignore
        onLabelStudioLoad: (LS) => {
          console.log(11111)
          const c = LS.annotationStore.addAnnotation({
            userGenerate: false,
          });
          LS.annotationStore.selectAnnotation(c.id);
        },
        // @ts-ignore
        onSubmitAnnotation: function (LS, annotations) {
          console.log(annotations.serializeAnnotation());
        },
        // @ts-ignore
        onUpdateAnnotation: function (LS, annotations, data) {
          console.log(annotations.serializeAnnotation());
        }
      });
    }
  }, []);

  // @ts-ignore
  return <div className="label-studio-root" ref={rootRef} />;
};

export default LabelImage;
