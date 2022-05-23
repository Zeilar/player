import { Story, Meta } from "@storybook/react";
import { IconButton, IconButtonProps } from ".";

export default {
	component: IconButton,
	title: "IconButton",
} as Meta;

const Template: Story<IconButtonProps> = args => (
	<div className="AngelinPlayer">
		<IconButton {...args} />
	</div>
);

export const Primary = Template.bind({});
Primary.args = {};
